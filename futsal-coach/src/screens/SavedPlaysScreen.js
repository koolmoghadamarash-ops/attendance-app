import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadPlays, deletePlay } from '../utils/storage';

function PlayCard({ play, onOpen, onDelete }) {
  const date = new Date(play.createdAt).toLocaleDateString('fa-IR');
  return (
    <TouchableOpacity style={styles.card} onPress={() => onOpen(play)} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <View style={styles.fieldThumb}>
          <View style={styles.fieldLine} />
          <View style={[styles.dot, styles.dotA]} />
          <View style={[styles.dot, styles.dotB]} />
        </View>
      </View>
      <View style={styles.cardMid}>
        <Text style={styles.cardTitle}>{play.title}</Text>
        <Text style={styles.cardMeta}>
          {date} • {play.keyframes?.length || 0} فریم • {play.paths?.length || 0} مسیر
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() =>
          Alert.alert('حذف', `"${play.title}" حذف شود؟`, [
            { text: 'خیر', style: 'cancel' },
            { text: 'حذف', style: 'destructive', onPress: () => onDelete(play.id) },
          ])
        }
      >
        <Text style={styles.deleteTxt}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function SavedPlaysScreen({ navigation }) {
  const [plays, setPlays] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadPlays().then(setPlays);
    }, [])
  );

  const handleDelete = useCallback(async (id) => {
    await deletePlay(id);
    setPlays((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleOpen = useCallback((play) => {
    navigation.navigate('TacticBoard', { playId: play.id, play });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← بازگشت</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>بازی‌های ذخیره شده</Text>
        <View style={{ width: 80 }} />
      </View>

      {plays.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>هنوز بازی‌ای ذخیره نشده</Text>
          <Text style={styles.emptyText}>تاکتیک‌های خود را در بورد طراحی کنید</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('TacticBoard', { playId: null })}
          >
            <Text style={styles.newBtnTxt}>+ بازی جدید</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plays}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlayCard play={item} onOpen={handleOpen} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: { padding: 4 },
  backTxt: { color: '#4ade80', fontSize: 14 },
  headerTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
  list: { padding: 16, gap: 4 },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardLeft: {},
  fieldThumb: {
    width: 56,
    height: 34,
    backgroundColor: '#166534',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fieldLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  dotA: {
    backgroundColor: '#ef4444',
    left: 10,
    top: '50%',
    marginTop: -4,
  },
  dotB: {
    backgroundColor: '#3b82f6',
    right: 10,
    top: '50%',
    marginTop: -4,
  },
  cardMid: { flex: 1 },
  cardTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', textAlign: 'right' },
  cardMeta: { color: '#64748b', fontSize: 11, marginTop: 3, textAlign: 'right' },
  deleteBtn: { padding: 8 },
  deleteTxt: { fontSize: 18 },
  divider: { height: 8 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { color: '#94a3b8', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptyText: { color: '#475569', fontSize: 13, textAlign: 'center' },
  newBtn: {
    marginTop: 8,
    backgroundColor: '#166534',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  newBtnTxt: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
