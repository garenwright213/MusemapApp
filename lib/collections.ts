import type { SeedPlace } from '@/data/places';

import { supabase } from './supabase';

// Rows as stored in Supabase. user_id is omitted everywhere: the DB default
// (auth.uid()) sets it, and RLS scopes every query to the logged-in user.

export type CollectionRow = {
  id: string;
  name: string;
  city: string | null;
  created_at: string;
};

export type SavedPlaceRow = {
  id: string;
  collection_id: string;
  place_name: string;
  place_type: string;
  place_city: string;
  seed_place_id: string;
  created_at: string;
};

export async function listCollections(): Promise<CollectionRow[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, city, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCollection(name: string): Promise<CollectionRow> {
  const { data, error } = await supabase
    .from('collections')
    .insert({ name })
    .select('id, name, city, created_at')
    .single();
  if (error) throw error;
  return data;
}

export async function listSavedPlaces(collectionId: string): Promise<SavedPlaceRow[]> {
  const { data, error } = await supabase
    .from('saved_places')
    .select('id, collection_id, place_name, place_type, place_city, seed_place_id, created_at')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addSavedPlace(collectionId: string, place: SeedPlace): Promise<void> {
  const { error } = await supabase.from('saved_places').insert({
    collection_id: collectionId,
    place_name: place.name,
    place_type: place.type,
    place_city: place.city,
    seed_place_id: place.id,
  });
  if (error) throw error;
}

export async function removeSavedPlace(rowId: string): Promise<void> {
  const { error } = await supabase.from('saved_places').delete().eq('id', rowId);
  if (error) throw error;
}

// Counts for the Profile "collector" stats. One RLS-scoped query: total rows =
// places saved, distinct place_city = cities. Lightweight for this data size.
export async function getSavedStats(): Promise<{ places: number; cities: number }> {
  const { data, error } = await supabase.from('saved_places').select('place_city');
  if (error) throw error;
  const rows = (data ?? []) as { place_city: string }[];
  return { places: rows.length, cities: new Set(rows.map((r) => r.place_city)).size };
}
