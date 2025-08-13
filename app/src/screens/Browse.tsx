import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { getShows } from '../api/client';

export function Browse() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shows, setShows] = useState<any[]>([]);

  useEffect(() => {
    const city = 'NYC';
    const date = '2025-08-14';
    getShows(city, date)
      .then(setShows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator /></View>;
  if (error) return <View style={{ padding:16 }}><Text>Failed: {error}</Text></View>;

  return (
    <FlatList
      data={shows}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text>No shows.</Text>}
      renderItem={({ item }) => (
        <Pressable style={{ padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontWeight: '600' }}>{item.movie}</Text>
          <Text>{new Date(item.startAt).toLocaleString()}</Text>
        </Pressable>
      )}
    />
  );
}
