import React from 'react';
import { Text } from 'react-native';

export function Money({ amount, currency }: { amount: number; currency: string }) {
  const value = (amount / 100).toFixed(2);
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '';
  return <Text>{symbol}{value} {symbol ? '' : currency}</Text>;
}
