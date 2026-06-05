// Local seed catalog of sample places. Placeholder data — curate later.
// Stored references in Supabase use the string `id` as `seed_place_id`.

export type PlaceType = 'cafe' | 'restaurant' | 'photo-spot' | 'club';

export type SeedPlace = {
  id: string;
  name: string;
  type: PlaceType;
  city: string;
  description: string;
};

export const PLACES: SeedPlace[] = [
  // --- Milan ---
  { id: 'milan-1', name: 'Bar Luce', type: 'cafe', city: 'Milan', description: 'Wes Anderson–designed café at Fondazione Prada.' },
  { id: 'milan-2', name: "Camparino in Galleria", type: 'cafe', city: 'Milan', description: 'Historic aperitivo bar under the Galleria arches.' },
  { id: 'milan-3', name: 'Ratanà', type: 'restaurant', city: 'Milan', description: 'Refined Milanese classics near Porta Nuova.' },
  { id: 'milan-4', name: 'Duomo Rooftop Terraces', type: 'photo-spot', city: 'Milan', description: 'Walk among the spires for skyline photos.' },
  { id: 'milan-5', name: 'Just Cavalli', type: 'club', city: 'Milan', description: 'Glamorous nightlife below the Branca Tower.' },

  // --- Paris ---
  { id: 'paris-1', name: 'Café de Flore', type: 'cafe', city: 'Paris', description: 'Iconic Left Bank café in Saint-Germain.' },
  { id: 'paris-2', name: 'Septime', type: 'restaurant', city: 'Paris', description: 'Modern bistro, a tough-to-book favorite.' },
  { id: 'paris-3', name: 'Rue Crémieux', type: 'photo-spot', city: 'Paris', description: 'Pastel cobblestone street made for photos.' },
  { id: 'paris-4', name: 'Trocadéro Gardens', type: 'photo-spot', city: 'Paris', description: 'The postcard view of the Eiffel Tower.' },
  { id: 'paris-5', name: 'Silencio', type: 'club', city: 'Paris', description: 'David Lynch–designed members-style club.' },

  // --- Madrid ---
  { id: 'madrid-1', name: 'Café Comercial', type: 'cafe', city: 'Madrid', description: 'Grand 1887 café on Glorieta de Bilbao.' },
  { id: 'madrid-2', name: 'Sobrino de Botín', type: 'restaurant', city: 'Madrid', description: "World's oldest restaurant, famed for cochinillo." },
  { id: 'madrid-3', name: 'Templo de Debod', type: 'photo-spot', city: 'Madrid', description: 'Egyptian temple with golden-hour sunsets.' },
  { id: 'madrid-4', name: 'Azotea del Círculo', type: 'photo-spot', city: 'Madrid', description: 'Rooftop terrace over Gran Vía.' },
  { id: 'madrid-5', name: 'Teatro Barceló', type: 'club', city: 'Madrid', description: 'Landmark three-floor nightclub.' },
];
