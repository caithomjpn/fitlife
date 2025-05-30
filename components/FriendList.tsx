// components/FriendList.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from './context/ThemeContext';
import { getColors } from '../constants/colors';

export default function FriendList() {
  const [friends, setFriends] = useState<any[]>([]);
  const { theme } = useTheme();
  const Colors = getColors(theme);

  useEffect(() => {
    const fetchFriends = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();
      const friendIds = data?.friends || [];

      const friendUsers = await Promise.all(
        friendIds.map(async (id: string) => {
          const fSnap = await getDoc(doc(db, 'users', id));
          return fSnap.exists() ? { id, ...fSnap.data() } : null;
        })
      );

      setFriends(friendUsers.filter(Boolean));
    };

    fetchFriends();
  }, []);

  return (
    <View style={{ padding: 20, backgroundColor: Colors.background }}>
      <Text style={{ fontSize: 24, color: Colors.primary, marginBottom: 10 }}>
        👯 Your Friends
      </Text>
      {friends.length === 0 ? (
        <Text style={{ color: Colors.textDark }}>No friends yet.</Text>
      ) : (
        friends.map((f) => (
          <View key={f.id} style={styles.card}>
            <Text style={{ color: Colors.textDark }}>{f.name || 'Unnamed'}</Text>
            <Text style={{ color: '#999', fontSize: 12 }}>{f.email || ''}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});
