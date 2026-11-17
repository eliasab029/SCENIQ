/**
 * Structured result of an image analysis.
 *
 * Every analyzer (on-device model, a possible cloud model, the demo mode) must return
 * exactly this shape. The recommender only ever reads this – never raw model text.
 */

/** Where an analysis came from. Shown in the UI so we never pretend rule-based output is AI. */
export type AnalysisSource = 'on-device' | 'cloud' | 'demo';

export type Tempo = 'slow' | 'mid' | 'fast';

export interface ImageAnalysis {
  schemaVersion: 1;
  source: AnalysisSource;
  /** Model identifier, e.g. "clip-vit-base-patch32". Undefined for demo mode. */
  model?: string;

  /** 1. + 2. What is visible and where/in which situation */
  content: {
    summary: string;
    subjects: string[];
    setting: string;
  };

  /** 3. + 4. Colors, light, visual aesthetic */
  visual: {
    dominantColors: string[];
    lighting: string;
    aesthetics: string[];
  };

  /** 5. + 6. Atmosphere and emotional effect */
  mood: {
    atmosphere: string[];
    emotions: string[];
    /** 0 = very calm … 1 = very energetic */
    energy: number;
    /** 0 = dark / sad … 1 = bright / happy */
    valence: number;
  };

  /** 7. + 8. Musical interpretation */
  music: {
    genres: string[];
    tempo: Tempo;
    /** Deliberate counter-ideas, e.g. "energetic track against a calm image" */
    contrastIdeas: string[];
  };

  /**
   * Normalized vocabulary tags (see features/music/vocabulary – Phase 5).
   * This is the bridge between free-text analysis and the song database.
   */
  tags: string[];
}
