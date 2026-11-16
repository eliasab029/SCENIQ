/**
 * Song catalogue model (Phase 5 fills the database).
 *
 * Rules for the catalogue:
 * - Only real, verifiable songs. Nothing invented.
 * - Fields we are not sure about stay undefined and are listed in `unverifiedFields`.
 */

export type Popularity = 'mainstream' | 'known' | 'niche';
export type Energy = 1 | 2 | 3 | 4 | 5;

export interface Song {
  /** Stable id: "artist-slug__title-slug" */
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  genres: string[];
  moods: string[];
  atmospheres: string[];
  energy: Energy;
  /** Approximate BPM, if known */
  bpm?: number;
  popularity: Popularity;
  /** Optional suggested section, e.g. "Refrain ab 0:58" */
  suggestedSection?: string;
  /** Fields that were filled from memory and still need checking */
  unverifiedFields?: (keyof Song)[];
}

/** The five recommendation approaches. */
export type RecommendationSlot = 'perfect' | 'aesthetic' | 'emotional' | 'unexpected' | 'hidden_gem';

export interface Recommendation {
  song: Song;
  slot: RecommendationSlot;
  score: number;
  reasons: {
    summary: string;
    whyPhoto: string;
    whyTaste: string;
    mood: string;
  };
}

/** Builds a Spotify search link – works without login, no API key, no Premium. */
export function spotifySearchUrl(song: Pick<Song, 'title' | 'artist'>): string {
  return `https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`;
}
