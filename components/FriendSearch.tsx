import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList
} from 'react-native';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { createNotification } from '../components/utils/notifications';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';

export default function FriendSearch() {
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const [users, setUsers] = useState<any[]>([]);
  const [queryText, setQueryText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [friendsList, setFriendsList] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const allUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
    };

    const fetchMyData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();

      setSentRequests(data?.sentRequests || []);
      setFriendsList(data?.friends || []);
    };

    fetchUsers();
    fetchMyData();
  }, []);

  useEffect(() => {
    if (queryText.trim() === '') {
      setFilteredUsers([]);
    } else {
      const q = queryText.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.id !== auth.currentUser?.uid &&
            (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
        )
      );
    }
  }, [queryText, users]);

  const sendFriendRequest = async (targetUserId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const myRef = doc(db, 'users', user.uid);
    const theirRef = doc(db, 'users', targetUserId);

    await updateDoc(myRef, { sentRequests: arrayUnion(targetUserId) });
    await updateDoc(theirRef, { friendRequests: arrayUnion(user.uid) });

    await createNotification(
      targetUserId,
      user.uid,
      user.displayName || 'Someone',
      'friend_request'
    );

    setSentRequests((prev) => [...prev, targetUserId]); 
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: Colors.background }}>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: Colors.primary,
            backgroundColor: Colors.background,
            color: Colors.textDark,
          },
        ]}
        placeholder="Search users by name or email"
        placeholderTextColor={Colors.textDark}
        value={queryText}
        onChangeText={setQueryText}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isRequested = sentRequests.includes(item.id);
          const isFriend = friendsList.includes(item.id);

          return (
            <View style={[styles.userItem, { backgroundColor: Colors.background }]}>
              <Text style={[styles.name, { color: Colors.textDark }]}>
                {item.name || 'No Name'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: isFriend
                      ? '#4caf50'
                      : isRequested
                      ? '#ccc'
                      : Colors.primary,
                  },
                ]}
                disabled={isFriend || isRequested}
                onPress={() => sendFriendRequest(item.id)}
              >
                <Text style={styles.addButtonText}>
                  {isFriend ? '👫 Friends' : isRequested ? '✔️ Requested' : '➕ Add Friend'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  userItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
