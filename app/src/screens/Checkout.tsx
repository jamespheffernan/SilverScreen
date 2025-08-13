import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { checkout, confirm, getOrder } from '../api/client';
import { useStripe, CardField } from '@stripe/stripe-react-native';

type Props = {
  show: any;
  seats: string[];
  onBack: () => void;
  onConfirmed: (order: any) => void;
};

export function CheckoutScreen({ show, seats, onBack, onConfirmed }: Props) {
  const { confirmPayment } = useStripe();
  const [email, setEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<{ amount: number; currency: string } | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  async function handleCheckout() {
    setLoading(true); setError(null);
    try {
      const resp = await checkout({ showId: show.id, seats, email });
      setQuote({ amount: resp.amount, currency: resp.currency });

      const clientSecret: string = resp.clientSecret;
      const isMock = clientSecret?.includes('_secret_mock');

      if (!isMock) {
        const { error: stripeErr } = await confirmPayment(clientSecret, { paymentMethodType: 'Card' });
        if (stripeErr) throw new Error(stripeErr.message);
      }

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
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, marginTop:12 }} />

      {/* Card input (used when Stripe is configured) */}
      <View style={{ marginTop: 12 }}>
        <CardField
          postalCodeEnabled={false}
          placeholders={{ number: '4242 4242 4242 4242' }}
          cardStyle={{ backgroundColor: '#FFFFFF', textColor: '#000000' }}
          style={{ width: '100%', height: 48 }}
          onCardChange={(c) => setCardComplete(!!c?.complete)}
        />
      </View>

      {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
      {quote ? <Text style={{ marginTop: 8 }}>Amount: {(quote.amount/100).toFixed(2)} {quote.currency}</Text> : null}

      <Pressable onPress={handleCheckout} style={{ backgroundColor:'#111', padding:12, borderRadius:8, marginTop: 16 }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Pay (test mode)</Text>
      </Pressable>
      <Text style={{ marginTop: 8, color: '#666' }}>Note: If Stripe isn’t configured, the server uses a mock flow.</Text>
    </View>
  );
}
