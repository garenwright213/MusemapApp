import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PLACES, type SeedPlace } from '@/data/places';
import {
  addSavedPlace,
  listSavedPlaces,
  removeSavedPlace,
  type CollectionRow,
  type SavedPlaceRow,
} from '@/lib/collections';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  field: '#FCFAF6',
  hairline: 'rgba(43, 33, 24, 0.12)',
  muted: 'rgba(43, 33, 24, 0.55)',
  error: '#A23B2D',
};

function formatType(type: string) {
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function CollectionDetail({
  collection,
  onBack,
}: {
  collection: CollectionRow;
  onBack: () => void;
}) {
  const [saved, setSaved] = useState<SavedPlaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [browsing, setBrowsing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setSaved(await listSavedPlaces(collection.id));
    } catch (e) {
      setError('Could not load saved places.');
      console.warn('listSavedPlaces failed', e);
    } finally {
      setLoading(false);
    }
  }, [collection.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // seed_place_id -> saved row, so we can show "saved" state and remove by row id.
  const savedBySeed = useMemo(() => {
    const map = new Map<string, SavedPlaceRow>();
    for (const row of saved) map.set(row.seed_place_id, row);
    return map;
  }, [saved]);

  const showAdd = query.trim().length > 0 || browsing;

  const catalogResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PLACES; // browsing with no query → whole catalog
    return PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q),
    );
  }, [query]);

  async function toggleSave(place: SeedPlace) {
    setBusyId(place.id);
    try {
      const existing = savedBySeed.get(place.id);
      if (existing) {
        await removeSavedPlace(existing.id);
      } else {
        await addSavedPlace(collection.id, place);
      }
      await refresh();
    } catch (e) {
      setError('Could not update that place. Please try again.');
      console.warn('toggleSave failed', e);
    } finally {
      setBusyId(null);
    }
  }

  async function removeRow(row: SavedPlaceRow) {
    setBusyId(row.id);
    try {
      await removeSavedPlace(row.id);
      await refresh();
    } catch (e) {
      setError('Could not remove that place. Please try again.');
      console.warn('removeRow failed', e);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <View style={styles.root}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.backRow}>
        <Text style={styles.back}>← Collections</Text>
      </Pressable>
      <Text style={styles.title}>{collection.name}</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search places to add"
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        <Pressable
          style={[styles.addButton, browsing && styles.addButtonActive]}
          onPress={() => setBrowsing((b) => !b)}
          hitSlop={6}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showAdd ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <Text style={styles.sectionLabel}>Add from catalog</Text>
          {catalogResults.length === 0 ? (
            <Text style={styles.empty}>No places match your search.</Text>
          ) : (
            catalogResults.map((p) => {
              const isSaved = savedBySeed.has(p.id);
              return (
                <View key={p.id} style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{p.name}</Text>
                    <Text style={styles.rowSub}>
                      {formatType(p.type)} · {p.city}
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.saveBtn, isSaved && styles.saveBtnOn, busyId === p.id && styles.disabled]}
                    onPress={() => toggleSave(p)}
                    disabled={busyId === p.id}>
                    {busyId === p.id ? (
                      <ActivityIndicator color={isSaved ? COLORS.textLight : COLORS.olive} />
                    ) : (
                      <Text style={[styles.saveBtnText, isSaved && styles.saveBtnTextOn]}>
                        {isSaved ? '✓ Saved' : '+ Save'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.olive} />
      ) : saved.length === 0 ? (
        <Text style={styles.empty}>No places saved yet. Search above to add some.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <Text style={styles.sectionLabel}>Saved places</Text>
          {saved.map((row) => (
            <View key={row.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{row.place_name}</Text>
                <Text style={styles.rowSub}>
                  {formatType(row.place_type)} · {row.place_city}
                </Text>
              </View>
              <Pressable
                style={[styles.removeBtn, busyId === row.id && styles.disabled]}
                onPress={() => removeRow(row)}
                disabled={busyId === row.id}
                hitSlop={8}>
                {busyId === row.id ? (
                  <ActivityIndicator color={COLORS.muted} />
                ) : (
                  <Text style={styles.removeText}>✕</Text>
                )}
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backRow: { marginBottom: 6 },
  back: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.olive },
  title: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: COLORS.dark, marginBottom: 16 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  search: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: COLORS.dark,
    backgroundColor: COLORS.field,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonActive: { opacity: 0.75 },
  addButtonText: { fontFamily: 'Inter_500Medium', fontSize: 26, color: COLORS.textLight, marginTop: -2 },

  loader: { marginTop: 40 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.error, marginBottom: 8 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.muted, marginTop: 28, textAlign: 'center' },

  list: { gap: 12, paddingBottom: 24 },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.muted,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.textLight,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 21, color: COLORS.dark },
  rowSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.muted, marginTop: 2 },

  saveBtn: {
    borderWidth: 1,
    borderColor: COLORS.olive,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnOn: { backgroundColor: COLORS.olive },
  saveBtnText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.olive },
  saveBtnTextOn: { color: COLORS.textLight },

  removeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: 'Inter_400Regular', fontSize: 18, color: COLORS.muted },
  disabled: { opacity: 0.5 },
});
