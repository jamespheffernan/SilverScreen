import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { getSeatMap } from '../api/client';
import { SeatGrid } from '../components/SeatGrid';

type Props = {
  show: any;
  onBack: () => void;
};

export function SeatMapScreen({ show, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatmap, setSeatmap] = useState<any | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    getSeatMap(show.id)
      .then(setSeatmap)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [show.id]);

  const total = useMemo(() => {
    if (!seatmap) return 0;
    const priceByCode = new Map(seatmap.seats.map((s: any) => [s.code, s.price?.amount ?? 0]));
    let sum = 0;
    for (const code of selected) sum += priceByCode.get(code) || 0;
    return sum;
  }, [seatmap, selected]);

  function toggle(code: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  if (loading) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator /></View>;
  if (error) return <View style={{ padding:16 }}><Text>Failed: {error}</Text></View>;
  if (!seatmap) return <View style={{ padding:16 }}><Text>No seatmap.</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={onBack}><Text>{'< Back'}</Text></Pressable>
        <Text style={{ fontWeight: '600' }}>{show.movie}</Text>
        <Text />
      </View>
      <SeatGrid seatmap={seatmap} selected={selected} onToggle={toggle} />
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#eee' }}>
        <Text>Selected: {Array.from(selected).join(', ') || '—'}</Text>
        <Text>Total: {(total / 100).toFixed(2)}</Text>
      </View>
    </View>
  );
}
