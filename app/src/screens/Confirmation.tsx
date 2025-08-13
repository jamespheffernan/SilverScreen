import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { getOrder } from '../api/client';

type Props = {
  order: any;
  onDone: () => void;
};

export function ConfirmationScreen({ order: initialOrder, onDone }: Props) {
  const [order, setOrder] = useState<any>(initialOrder);
  const [loading, setLoading] = useState<boolean>(order?.state !== 'purchased' && order?.state !== 'failed');

  useEffect(() => {
    let active = true;
    let timer: any;

    async function poll() {
      try {
        const latest = await getOrder(order.id);
        if (!active) return;
        setOrder(latest);
        if (latest.state === 'purchased' || latest.state === 'failed') {
          setLoading(false);
          return;
        }
      } catch (_) {
        // ignore transient errors
      }
      timer = setTimeout(poll, 1500);
    }

    if (loading) poll();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [order.id, loading]);

  return (
    <View style={{ flex:1, padding:16, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontWeight: '700', fontSize: 20 }}>Confirmation</Text>
      <Text style={{ marginTop: 8 }}>Order ID: {order.id}</Text>
      {loading ? (
        <View style={{ marginTop: 12 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, textAlign: 'center' }}>Processing purchase…</Text>
        </View>
      ) : (
        <>
          <Text style={{ marginTop: 4 }}>Status: {order.state}</Text>
          <Text style={{ marginTop: 4 }}>External: {order.confirmation?.externalOrderId || '—'}</Text>
          <Pressable onPress={onDone} style={{ marginTop: 16, padding: 12, borderWidth:1, borderColor:'#ddd', borderRadius:8 }}>
            <Text>Done</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
