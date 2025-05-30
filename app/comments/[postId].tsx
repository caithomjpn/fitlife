import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc
} from 'firebase/firestore';
import { useTheme } from '../../components/context/ThemeContext';
import { getColors } from '../../constants/colors';

export default function CommentPage() {
  const { postId } = useLocalSearchParams();
  const { theme } = useTheme();
  const Colors = getColors(theme);
  const router = useRouter();

  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, 'posts', String(postId), 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(data);
    });

    return () => unsubscribe();
  }, [postId]);

const handleSend = async () => {
  const user = auth.currentUser;
  if (!user || !commentText.trim()) return;

  // ✅ Firestoreから名前を取得
  let fromUserName = 'Anonymous';
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.name) {
        fromUserName = userData.name;
      }
    }
  } catch (error) {
    console.log("Failed to fetch name from Firestore:", error);
  }

  await addDoc(collection(db, 'posts', String(postId), 'comments'), {
    text: commentText.trim(),
    fromUserId: user.uid,
    fromUserName,
    createdAt: serverTimestamp(),
  });

  setCommentText('');
};


  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.title, { color: Colors.primary }]}>💬 Comments</Text>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Text style={[styles.user, { color: Colors.textDark }]}>{item.fromUserName}</Text>
            <Text style={[styles.text, { color: Colors.textDark }]}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
          placeholder="Write a comment..."
          placeholderTextColor={Colors.textDark}
          value={commentText}
          onChangeText={setCommentText}
        />
        <Button title="Send" onPress={handleSend} />
      </View>

      {/* ✅ Back to Social Button */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: Colors.primary }]}
        onPress={() => router.push('/social')}
      >
        <Text style={styles.backButtonText}>⬅ Back to Social</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  commentItem: { marginBottom: 10 },
  user: { fontWeight: 'bold' },
  text: { marginTop: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
