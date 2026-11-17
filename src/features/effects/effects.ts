/**
 * Desired story effects ("Gewünschte Wirkung").
 * The ids are stable and stored in the database – never rename an id, only labels.
 */
export interface StoryEffect {
  id: EffectId;
  label: string;
  /** One short line shown under the selection */
  hint: string;
}

export type EffectId =
  | 'cool'
  | 'aesthetic'
  | 'confident'
  | 'melancholic'
  | 'nostalgic'
  | 'mysterious'
  | 'energetic'
  | 'relaxed'
  | 'romantic'
  | 'humorous'
  | 'unusual'
  | 'surprise';

export const SURPRISE_EFFECT: StoryEffect = {
  id: 'surprise',
  label: 'Überrasche mich',
  hint: 'SCENIQ entscheidet anhand von Foto und Geschmack.',
};

export const STORY_EFFECTS: StoryEffect[] = [
  { id: 'cool', label: 'Cool & unaufgeregt', hint: 'Lässig, souverän, nichts muss.' },
  { id: 'aesthetic', label: 'Ästhetisch & stilvoll', hint: 'Klar, ruhig, durchkomponiert.' },
  { id: 'confident', label: 'Selbstbewusst', hint: 'Präsenz und Haltung.' },
  { id: 'melancholic', label: 'Emotional & melancholisch', hint: 'Nachdenklich, bittersüß.' },
  { id: 'nostalgic', label: 'Nostalgisch', hint: 'Erinnerung, Wärme, früher.' },
  { id: 'mysterious', label: 'Geheimnisvoll', hint: 'Dunkel, offen, neugierig machend.' },
  { id: 'energetic', label: 'Energetisch', hint: 'Tempo, Puls, Bewegung.' },
  { id: 'relaxed', label: 'Entspannt', hint: 'Leicht, sonnig, ohne Druck.' },
  { id: 'romantic', label: 'Romantisch', hint: 'Nähe und Zärtlichkeit.' },
  { id: 'humorous', label: 'Humorvoll', hint: 'Augenzwinkern, Selbstironie.' },
  { id: 'unusual', label: 'Ungewöhnlich & individuell', hint: 'Abseits des Offensichtlichen.' },
];

export function getEffect(id: EffectId | null | undefined): StoryEffect | undefined {
  if (!id) return undefined;
  if (id === 'surprise') return SURPRISE_EFFECT;
  return STORY_EFFECTS.find((e) => e.id === id);
}
