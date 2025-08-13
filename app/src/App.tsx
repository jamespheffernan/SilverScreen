import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { Browse } from './screens/Browse';
import { SeatMapScreen } from './screens/SeatMap';
import { CheckoutScreen } from './screens/Checkout';
import { ConfirmationScreen } from './screens/Confirmation';

export default function App() {
  const [screen, setScreen] = useState<'browse'|'seat'|'checkout'|'confirm'>('browse');
  const [selectedShow, setSelectedShow] = useState<any | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [order, setOrder] = useState<any | null>(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {screen === 'browse' && (
        <Browse onSelect={(s) => { setSelectedShow(s); setScreen('seat'); }} />
      )}
      {screen === 'seat' && selectedShow && (
        <SeatMapScreen show={selectedShow} onBack={() => { setScreen('browse'); setSelectedShow(null); }} onProceed={(seats)=>{ setSelectedSeats(seats); setScreen('checkout'); }} />
      )}
      {screen === 'checkout' && selectedShow && (
        <CheckoutScreen show={selectedShow} seats={selectedSeats} onBack={() => setScreen('seat')} onConfirmed={(ord)=>{ setOrder(ord); setScreen('confirm'); }} />
      )}
      {screen === 'confirm' && order && (
        <ConfirmationScreen order={order} onDone={() => { setScreen('browse'); setOrder(null); setSelectedShow(null); setSelectedSeats([]); }} />
      )}
    </SafeAreaView>
  );
}
