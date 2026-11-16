import { useSyncExternalStore } from 'react';

import type { EffectId } from '@/features/effects/effects';

/**
 * In-memory state of the analysis currently being set up (photo → effect → analyze).
 * Kept out of the URL because image URIs can be very long (data URIs on web).
 * Not persisted: a finished analysis is saved to SQLite (Phase 3).
 */
export interface AnalysisDraft {
  image: { uri: string; width: number; height: number } | null;
  effect: EffectId | null;
}

let draft: AnalysisDraft = { image: null, effect: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const draftStore = {
  get: () => draft,
  setImage(image: AnalysisDraft['image']) {
    draft = { ...draft, image };
    emit();
  },
  setEffect(effect: EffectId | null) {
    draft = { ...draft, effect };
    emit();
  },
  reset() {
    draft = { image: null, effect: null };
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useAnalysisDraft(): AnalysisDraft {
  return useSyncExternalStore(draftStore.subscribe, draftStore.get, draftStore.get);
}
