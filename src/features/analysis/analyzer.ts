import type { AnalysisSource, ImageAnalysis } from './types';

/**
 * Exchangeable image-analysis interface.
 *
 * Planned (Phase 4): OnDeviceAnalyzer (vision model running in the browser) and
 * DemoAnalyzer (rule-based fallback, always labelled "Demo").
 * Possible later: a cloud analyzer – it implements the same interface without touching any screen.
 */
export interface ImageAnalyzer {
  readonly source: AnalysisSource;
  /** Human-readable name for the UI, e.g. "Auf dem Gerät · CLIP" */
  readonly label: string;
  /** True only if a real vision model looks at the pixels. Demo/rule-based = false. */
  readonly isRealAI: boolean;

  checkAvailability(signal?: AbortSignal): Promise<AvailabilityResult>;
  analyze(input: AnalyzeInput, signal?: AbortSignal): Promise<ImageAnalysis>;
}

export interface AnalyzeInput {
  /** Local file URI of the (already downscaled) image */
  imageUri: string;
  /** Base64 JPEG without data-URI prefix */
  imageBase64: string;
  /** Optional desired story effect chosen by the user */
  desiredEffect?: string;
}

export type AvailabilityResult =
  | { available: true; detail?: string }
  | { available: false; reason: string };
