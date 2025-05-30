import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';
import { createNotification } from '../components/utils/notifications';

export default function FriendRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const { theme } = useTheme();
  const Colors = getColors(theme);

  useEffect(() => {
    const fetchRequests = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();
      const requestIds = data?.friendRequests || [];

      const users = await Promise.all(
        requestIds.map(async (id: string) => {
          const uSnap = await getDoc(doc(db, 'users', id));
          return uSnap.exists() ? { id, ...uSnap.data() } : null;
        })
      );
      setRequests(users.filter(Boolean));
    };

    fetchRequests();
  }, []);

  const acceptRequest = async (otherId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const myRef = doc(db, 'users', user.uid);
    const theirRef = doc(db, 'users', otherId);

    // Remove from requests
    await updateDoc(myRef, {
      friendRequests: arrayRemove(otherId),
      friends: arrayUnion(otherId),
    });
    await updateDoc(theirRef, {
      sentRequests: arrayRemove(user.uid),
      friends: arrayUnion(user.uid),
    });

    await createNotification(
      otherId,
      user.uid,
      user.displayName || 'Someone',
      'friend_accept'
    );

    setRequests(prev => prev.filter(r => r.id !== otherId));
  };

  return (
    <View style={{ padding: 20, backgroundColor: Colors.background }}>
      <Text style={{ fontSize: 24, color: Colors.primary, marginBottom: 10 }}>
        Pending Friend Requests
      </Text>
      {requests.length === 0 ? (
        <Text style={{ color: Colors.textDark }}>No requests</Text>
      ) : (
        requests.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={{ color: Colors.textDark }}>{r.name || 'No Name'}</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.primary }]}
              onPress={() => acceptRequest(r.id)}
            >
              <Text style={{ color: '#fff' }}>✅ Accept</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 6,
    borderRadius: 6,
  },
});
