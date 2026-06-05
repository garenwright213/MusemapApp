import { useState } from 'react';

import type { CollectionRow } from '@/lib/collections';

import { CollectionDetail } from './collection-detail';
import { PlacesCollections } from './places-collections';

/**
 * The "Places" sub-tab. Switches in-screen between the collections list and a
 * single open collection (no extra Expo Router routes). Unmounting the list when
 * a collection opens means it refetches on return.
 */
export function SavedPlaces() {
  const [open, setOpen] = useState<CollectionRow | null>(null);

  if (open) {
    return <CollectionDetail collection={open} onBack={() => setOpen(null)} />;
  }
  return <PlacesCollections onOpen={setOpen} />;
}
