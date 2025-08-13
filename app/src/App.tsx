import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { Browse } from './screens/Browse';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Browse />
    </SafeAreaView>
  );
}
