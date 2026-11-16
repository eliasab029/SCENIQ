/**
 * Minimal HTTP client for a local Ollama server (running on the user's PC).
 *
 * Phase 1: connection test only (version, installed models, vision capability).
 * Phase 4: the actual image analysis (/api/chat with images + JSON schema) is added here.
 */

export const DEFAULT_OLLAMA_PORT = 11434;
const DEFAULT_TIMEOUT_MS = 5000;

export interface OllamaModelInfo {
  name: string;
  sizeBytes: number;
}

export type ConnectionCheck =
  | {
      ok: true;
      baseUrl: string;
      version: string | null;
      models: OllamaModelInfo[];
      selectedModel: {
        name: string;
        installed: boolean;
        /** null = could not be determined (older Ollama without capability info) */
        supportsVision: boolean | null;
      };
    }
  | { ok: false; baseUrl: string; error: ConnectionError; message: string };

export type ConnectionError = 'invalid-url' | 'timeout' | 'unreachable' | 'bad-response';

/**
 * Normalizes user input like "192.168.178.20" → "http://192.168.178.20:11434".
 * Returns null if the input cannot be a URL.
 */
export function normalizeOllamaUrl(input: string): string | null {
  let value = input.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = `http://${value}`;
  value = value.replace(/\/+$/, '');

  const match = value.match(/^(https?):\/\/([^/:\s]+)(?::(\d{1,5}))?(\/.*)?$/i);
  if (!match) return null;
  const [, scheme, host, port, path = ''] = match;
  return `${scheme.toLowerCase()}://${host}:${port ?? DEFAULT_OLLAMA_PORT}${path}`;
}

async function fetchJson<T>(url: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) throw new OllamaHttpError(res.status);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

class OllamaHttpError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

/**
 * Checks whether Ollama is reachable and whether the configured model is installed
 * and able to process images. Never throws – always returns a result object.
 */
export async function checkOllamaConnection(rawUrl: string, modelName: string): Promise<ConnectionCheck> {
  const baseUrl = normalizeOllamaUrl(rawUrl);
  if (!baseUrl) {
    return { ok: false, baseUrl: rawUrl, error: 'invalid-url', message: 'Die Adresse ist ungültig.' };
  }

  try {
    const tags = await fetchJson<{ models?: { name: string; size?: number }[] }>(`${baseUrl}/api/tags`);
    const models: OllamaModelInfo[] = (tags.models ?? []).map((m) => ({ name: m.name, sizeBytes: m.size ?? 0 }));

    const version = await fetchJson<{ version?: string }>(`${baseUrl}/api/version`)
      .then((v) => v.version ?? null)
      .catch(() => null);

    const wanted = modelName.trim();
    const installed = models.some((m) => m.name === wanted || m.name === `${wanted}:latest`);

    let supportsVision: boolean | null = null;
    if (installed) {
      supportsVision = await fetchJson<{ capabilities?: string[] }>(`${baseUrl}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: wanted }),
      })
        .then((info) => (Array.isArray(info.capabilities) ? info.capabilities.includes('vision') : null))
        .catch(() => null);
    }

    return { ok: true, baseUrl, version, models, selectedModel: { name: wanted, installed, supportsVision } };
  } catch (e) {
    if (e instanceof OllamaHttpError) {
      return {
        ok: false,
        baseUrl,
        error: 'bad-response',
        message: `Server antwortet, aber nicht wie Ollama (${e.message}).`,
      };
    }
    const aborted = e instanceof Error && e.name === 'AbortError';
    return {
      ok: false,
      baseUrl,
      error: aborted ? 'timeout' : 'unreachable',
      message: aborted
        ? 'Keine Antwort innerhalb von 5 Sekunden.'
        : 'Ollama ist nicht erreichbar. Läuft Ollama auf dem PC und sind beide Geräte im selben WLAN?',
    };
  }
}
