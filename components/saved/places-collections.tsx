import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createCollection, listCollections, type CollectionRow } from '@/lib/collections';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  field: '#FCFAF6',
  hairline: 'rgba(43, 33, 24, 0.12)',
  muted: 'rgba(43, 33, 24, 0.55)',
  backdrop: 'rgba(20, 16, 12, 0.45)',
  error: '#A23B2D',
};

export function PlacesCollections({ onOpen }: { onOpen: (collection: CollectionRow) => void }) {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setCollections(await listCollections());
    } catch (e) {
      setError('Could not load your collections. Pull to retry.');
      console.warn('listCollections failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) {
      setCreateError('Please enter a name.');
      return;
    }
    setSaving(true);
    setCreateError(null);
    try {
      await createCollection(name);
      setNewName('');
      setCreating(false);
      await refresh();
    } catch (e) {
      setCreateError('Could not create that collection. Please try again.');
      console.warn('createCollection failed', e);
    } finally {
      setSaving(false);
    }
  }

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <View style={styles.root}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search collections"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        <Pressable style={styles.addButton} onPress={() => setCreating(true)} hitSlop={6}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.olive} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>
          {collections.length === 0
            ? 'No collections yet — tap + to create one.'
            : 'No collections match your search.'}
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.map((c) => (
            <Pressable key={c.id} style={styles.row} onPress={() => onOpen(c)}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{c.name}</Text>
                {c.city ? <Text style={styles.rowSub}>{c.city}</Text> : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* New collection modal */}
      <Modal visible={creating} transparent animationType="fade" onRequestClose={() => setCreating(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCreating(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Name your collection</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Milan Spring"
                placeholderTextColor={COLORS.muted}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
              {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalCancel}
                  onPress={() => {
                    setCreating(false);
                    setNewName('');
                    setCreateError(null);
                  }}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalCreate, saving && styles.disabled]}
                  onPress={handleCreate}
                  disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color={COLORS.textLight} />
                  ) : (
                    <Text style={styles.modalCreateText}>Create</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
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
  addButtonText: { fontFamily: 'Inter_500Medium', fontSize: 26, color: COLORS.textLight, marginTop: -2 },
  loader: { marginTop: 40 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.error, marginTop: 8 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.muted, marginTop: 32, textAlign: 'center' },
  list: { gap: 12, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.textLight,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 22, color: COLORS.dark },
  rowSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.muted, marginTop: 2 },
  chevron: { fontFamily: 'Inter_400Regular', fontSize: 24, color: COLORS.olive },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: COLORS.backdrop, justifyContent: 'center', paddingHorizontal: 28 },
  modalCard: { backgroundColor: COLORS.cream, borderRadius: 22, padding: 22 },
  modalTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 26, color: COLORS.dark, marginBottom: 14 },
  modalInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: COLORS.dark,
    backgroundColor: COLORS.field,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 18 },
  modalCancel: { paddingVertical: 12, paddingHorizontal: 18 },
  modalCancelText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: COLORS.muted },
  modalCreate: {
    backgroundColor: COLORS.olive,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
  },
  modalCreateText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: COLORS.textLight },
  disabled: { opacity: 0.6 },
});
