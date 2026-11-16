import type { Popularity } from '@/features/music/types';

/**
 * Personal music profile (Phase 3).
 * Stored locally in SQLite (table `profile`, one JSON document).
 */
export interface MusicProfile {
  schemaVersion: 1;
  onboardingDone: boolean;

  favoriteGenres: string[];
  favoriteArtists: string[];
  favoriteMoods: string[];
  dislikedGenres: string[];

  /** 1 (sehr ruhig) … 5 (sehr energiegeladen) */
  preferredIntensity: number;
  preferredPopularity: Popularity | 'mixed';
  /** 0 = only known songs … 1 = I love discovering unknown music */
  discoveryAppetite: number;
  preferredDecades: number[];

  /**
   * Learned weights from feedback, e.g. { "genre:indie": 0.6, "mood:melancholic": 0.4 }.
   * Range −1 … +1. Updated by the feedback system.
   */
  learnedAffinities: Record<string, number>;

  updatedAt: number;
}

export type FeedbackKind = 'like' | 'dislike' | 'more' | 'not_my_style';
