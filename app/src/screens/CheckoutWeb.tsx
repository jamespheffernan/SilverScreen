import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { checkout, confirm, getOrder } from '../api/client';
import { Money } from '../components/Money';

function CheckoutWebInner({ show, seats, onBack, onConfirmed }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<{ amount: number; currency: string } | null>(null);

  async function handleCheckout() {
    if (!stripe || !elements) return;
    setLoading(true); setError(null);
    try {
      const resp = await checkout({ showId: show.id, seats, email });
      setQuote({ amount: resp.amount, currency: resp.currency });
      const clientSecret: string = resp.clientSecret;
      const card = elements.getElement(CardElement);
      const { error: stripeErr } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } as any });
      if (stripeErr) throw new Error(stripeErr.message);
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
    <View style={{ flex:1, padding:16 }}>
      <Pressable onPress={onBack}><Text>{'< Back'}</Text></Pressable>
      <Text style={{ fontWeight:'600', fontSize:18, marginTop:8 }}>Checkout</Text>
      <Text style={{ marginTop:4 }}>{show.movie}</Text>
      <Text style={{ marginTop:4 }}>Seats: {seats.join(', ')}</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, marginTop:12 }} />
      <View style={{ marginTop:12, padding:8, borderWidth:1, borderColor:'#ddd', borderRadius:8, backgroundColor:'#fff' }}>
        <CardElement options={{ hidePostalCode:true }} />
      </View>
      {error ? <Text style={{ color:'red', marginTop:8 }}>{error}</Text> : null}
      {quote ? <Text style={{ marginTop:8 }}>Amount: <Money amount={quote.amount} currency={quote.currency} /></Text> : null}
      <Pressable onPress={handleCheckout} style={{ backgroundColor:'#111', padding:12, borderRadius:8, marginTop:16 }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Pay (web)</Text>
      </Pressable>
    </View>
  );
}

export default function CheckoutWeb(props: any) {
  const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  return (
    <Elements stripe={stripePromise}>
      <CheckoutWebInner {...props} />
    </Elements>
  );
}