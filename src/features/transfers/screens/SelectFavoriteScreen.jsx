// src/features/transfers/screens/SelectFavoriteScreen.jsx
import { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { useConfirm, useToast } from '@/shared/feedback/FeedbackProvider';
import { Card, EmptyState, LoadingSpinner, ErrorText } from '@/shared/components/common/Common';
import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { useTransfers } from '@/features/transfers/hooks/useTransfers';
import { useTransferStore } from '@/shared/store/transferStore';

export default function SelectFavoriteScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const confirm = useConfirm();
  const showToast = useToast();
  const { favorites, loading, addFavorite, removeFavorite, updateFavorite } = useTransfers();
  const setDestination = useTransferStore((s) => s.setDestination);

  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [alias, setAlias] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [editingFav, setEditingFav] = useState(null);
  const [editAlias, setEditAlias] = useState('');
  const [editError, setEditError] = useState(null);
  const [editBusy, setEditBusy] = useState(false);

  const filtered = useMemo(
    () =>
      favorites.filter(
        (f) =>
          f.alias?.toLowerCase().includes(query.toLowerCase()) ||
          String(f.accountNumber || '').includes(query),
      ),
    [favorites, query],
  );

  const pick = (fav) => {
    setDestination({ type: 'favorite', favoriteId: fav.id, alias: fav.alias, accountNumber: fav.accountNumber });
    navigation.navigate('NewTransfer');
  };

  const onAdd = async () => {
    if (!alias.trim() || !accountNumber.trim()) {
      setError(t('common.required'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await addFavorite({ alias: alias.trim(), accountNumber: accountNumber.trim() });
      setAlias('');
      setAccountNumber('');
      setAdding(false);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.errorGeneric'));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (fav) => {
    setAdding(false);
    setEditingFav(fav);
    setEditAlias(fav.alias);
    setEditError(null);
  };

  const onSaveEdit = async () => {
    if (!editAlias.trim()) {
      setEditError(t('common.required'));
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      await updateFavorite(editingFav.id, editAlias.trim());
      setEditingFav(null);
      showToast(t('transfers.aliasUpdated'), { variant: 'success' });
    } catch (err) {
      setEditError(err?.response?.data?.message || err?.message || t('common.errorGeneric'));
    } finally {
      setEditBusy(false);
    }
  };

  const confirmRemove = async (fav) => {
    const ok = await confirm({
      title: fav.alias,
      message: t('common.delete') + '?',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      destructive: true,
    });
    if (ok) removeFavorite(fav.id);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Input value={query} onChangeText={setQuery} placeholder={t('common.search')} leftIcon="search" />
        {editingFav ? (
          <Card style={styles.addCard}>
            <Input label={t('transfers.alias')} value={editAlias} onChangeText={setEditAlias} placeholder={t('transfers.aliasPlaceholder')} autoCapitalize="words" />
            <ErrorText>{editError}</ErrorText>
            <View style={styles.addActions}>
              <Button title={t('common.cancel')} variant="secondary" onPress={() => setEditingFav(null)} style={styles.flex} />
              <Button title={t('common.save')} onPress={onSaveEdit} loading={editBusy} style={styles.flex} />
            </View>
          </Card>
        ) : adding ? (
          <Card style={styles.addCard}>
            <Input label={t('transfers.alias')} value={alias} onChangeText={setAlias} placeholder={t('transfers.aliasPlaceholder')} autoCapitalize="words" />
            <Input label={t('transfers.destinationAccountNumber')} value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
            <ErrorText>{error}</ErrorText>
            <View style={styles.addActions}>
              <Button title={t('common.cancel')} variant="secondary" onPress={() => setAdding(false)} style={styles.flex} />
              <Button title={t('common.save')} onPress={onAdd} loading={busy} style={styles.flex} />
            </View>
          </Card>
        ) : (
          <Button title={t('transfers.addFavorite')} icon="add" variant="secondary" onPress={() => setAdding(true)} />
        )}
      </View>

      {loading && favorites.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState icon="star-border" message={t('transfers.noFavorites')} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => pick(item)} style={styles.favRow}>
              <View style={styles.favIcon}>
                <MaterialIcons name="star" size={20} color={colors.warning} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.favAlias}>{item.alias}</Text>
                <Text style={styles.favNumber}>•••• {String(item.accountNumber || '').slice(-4)}</Text>
              </View>
              <Pressable onPress={() => startEdit(item)} hitSlop={8} style={styles.delBtn}>
                <MaterialIcons name="edit" size={20} color={colors.textLight} />
              </Pressable>
              <Pressable onPress={() => confirmRemove(item)} hitSlop={8} style={styles.delBtn}>
                <MaterialIcons name="delete-outline" size={20} color={colors.error} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    top: { padding: SPACING.gutter, paddingBottom: 0 },
    addCard: { marginTop: SPACING.sm },
    addActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
    flex: { flex: 1 },
    listContent: { padding: SPACING.gutter, flexGrow: 1 },
    favRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
    favIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.warningSurface, alignItems: 'center', justifyContent: 'center' },
    favAlias: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text },
    favNumber: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight },
    delBtn: { padding: SPACING.xs },
  });
}
