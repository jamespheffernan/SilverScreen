import React, { useState } from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import { Browse } from './screens/Browse';
import { SeatMapScreen } from './screens/SeatMap';
import CheckoutWeb from './screens/CheckoutWeb';
import { ConfirmationScreen } from './screens/Confirmation';

const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_12345';

export default function App() {
  const [screen, setScreen] = useState<'browse'|'seat'|'checkout'|'confirm'>('browse');
  const [selectedShow, setSelectedShow] = useState<any | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [order, setOrder] = useState<any | null>(null);

  // Conditionally require native Stripe provider and Checkout screen
  const isWeb = Platform.OS === 'web';
  const StripeProvider = !isWeb ? require('@stripe/stripe-react-native').StripeProvider : ({ children }: any) => children;
  const CheckoutScreen = !isWeb ? require('./screens/Checkout').CheckoutScreen : null;

  return (
    <StripeProvider publishableKey={PUBLISHABLE_KEY}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        {screen === 'browse' && (
          <Browse onSelect={(s) => { setSelectedShow(s); setScreen('seat'); }} />
        )}
        {screen === 'seat' && selectedShow && (
          <SeatMapScreen show={selectedShow} onBack={() => { setScreen('browse'); setSelectedShow(null); }} onProceed={(seats)=>{ setSelectedSeats(seats); setScreen('checkout'); }} />
        )}
        {screen === 'checkout' && selectedShow && (
          isWeb ? (
            <CheckoutWeb show={selectedShow} seats={selectedSeats} onBack={() => setScreen('seat')} onConfirmed={(ord)=>{ setOrder(ord); setScreen('confirm'); }} />
          ) : (
            CheckoutScreen && <CheckoutScreen show={selectedShow} seats={selectedSeats} onBack={() => setScreen('seat')} onConfirmed={(ord: any)=>{ setOrder(ord); setScreen('confirm'); }} />
          )
        )}
        {screen === 'confirm' && order && (
          <ConfirmationScreen order={order} onDone={() => { setScreen('browse'); setOrder(null); setSelectedShow(null); setSelectedSeats([]); }} />
        )}
      </SafeAreaView>
    </StripeProvider>
  );
}