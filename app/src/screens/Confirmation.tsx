import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = {
  order: any;
  onDone: () => void;
};

export function ConfirmationScreen({ order, onDone }: Props) {
  return (
    <View style={{ flex:1, padding:16, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontWeight: '700', fontSize: 20 }}>Confirmed</Text>
      <Text style={{ marginTop: 8 }}>Order ID: {order.id}</Text>
      <Text style={{ marginTop: 4 }}>External: {order.confirmation?.externalOrderId}</Text>
      <Pressable onPress={onDone} style={{ marginTop: 16, padding: 12, borderWidth:1, borderColor:'#ddd', borderRadius:8 }}>
        <Text>Done</Text>
      </Pressable>
    </View>
  );
}
