import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

type Seat = { row: string; col: number; code: string; status: 'free' | 'sold' | 'held' };

type Props = {
  seatmap: { rows: number; cols: number; seats: Seat[] };
  selected: Set<string>;
  onToggle: (code: string) => void;
};

export function SeatGrid({ seatmap, selected, onToggle }: Props) {
  const byPos = new Map(seatmap.seats.map(s => [`${s.row}-${s.col}`, s]));
  const rowLabels = Array.from(new Set(seatmap.seats.map(s => s.row)));
  return (
    <View style={styles.wrap}>
      {rowLabels.map(r => (
        <View key={r} style={styles.row}>
          {Array.from({ length: seatmap.cols }).map((_, i) => {
            const s = byPos.get(`${r}-${i + 1}`);
            if (!s) return <View key={i} style={[styles.seat, styles.blank]} />;
            const isSel = selected.has(s.code);
            const style = [styles.seat, s.status === 'sold' ? styles.sold : (isSel ? styles.sel : styles.free)];
            return (
              <Pressable key={i} style={style} disabled={s.status !== 'free'} onPress={() => onToggle(s.code)}>
                <Text style={styles.tiny}>{i + 1}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, padding: 16 },
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  seat: { width: 24, height: 24, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  free: { borderWidth: 1, borderColor: '#999' },
  sold: { backgroundColor: '#ccc' },
  sel: { borderWidth: 2, borderColor: '#333' },
  blank: { opacity: 0 },
  tiny: { fontSize: 8 }
});
