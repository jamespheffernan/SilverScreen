import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { Browse } from './screens/Browse';
import { SeatMapScreen } from './screens/SeatMap';

export default function App() {
  const [selectedShow, setSelectedShow] = useState<any | null>(null);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {selectedShow ? (
        <SeatMapScreen show={selectedShow} onBack={() => setSelectedShow(null)} />
      ) : (
        <Browse onSelect={setSelectedShow} />
      )}
    </SafeAreaView>
  );
}
