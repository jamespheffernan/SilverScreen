import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { checkout, confirm, getOrder } from '../api/client';

type Props = {
  show: any;
  seats: string[];
  onBack: () => void;
  onConfirmed: (order: any) => void;
};

export function CheckoutScreen({ show, seats, onBack, onConfirmed }: Props) {
  const [email, setEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<{ amount: number; currency: string } | null>(null);

  async function handleCheckout() {
    setLoading(true); setError(null);
    try {
      const resp = await checkout({ showId: show.id, seats, email });
      setQuote({ amount: resp.amount, currency: resp.currency });
      await confirm(resp.orderId);
      const ord = await getOrder(resp.orderId);
      onConfirmed(ord);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator /></View>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Pressable onPress={onBack}><Text>{'< Back'}</Text></Pressable>
      <Text style={{ fontWeight: '600', fontSize: 18, marginTop: 8 }}>Checkout</Text>
      <Text style={{ marginTop: 4 }}>{show.movie}</Text>
      <Text style={{ marginTop: 4 }}>Seats: {seats.join(', ')}</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, marginTop:12 }} />
      {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
      {quote ? <Text style={{ marginTop: 8 }}>Amount: {(quote.amount/100).toFixed(2)} {quote.currency}</Text> : null}
      <Pressable onPress={handleCheckout} style={{ backgroundColor:'#111', padding:12, borderRadius:8, marginTop: 16 }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Pay (test mode)</Text>
      </Pressable>
    </View>
  );
}
