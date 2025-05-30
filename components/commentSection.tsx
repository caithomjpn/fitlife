import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { createNotification } from './utils/notifications'; // パスに注意

interface CommentSectionProps {
  postId: string;
  postOwnerUid: string;
}

export default function CommentSection({ postId, postOwnerUid }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(data);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSendComment = async () => {
    const user = auth.currentUser;
    if (!user || !comment.trim()) return;

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      text: comment.trim(),
      fromUserId: user.uid,
      fromUserName: user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    });

    setComment('');

    // 🔔 通知
    if (postOwnerUid !== user.uid) {
      await createNotification(
        postOwnerUid,
        user.uid,
        user.displayName || 'Anonymous',
        'comment',
        { postId }
      );
    }
  };

  return (
    <View style={styles.container}>
      <View>
        {comments.map((item) => (
          <View key={item.id} style={styles.commentItem}>
            <Text style={styles.user}>{item.fromUserName}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        ))}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={comment}
          onChangeText={setComment}
        />
        <Button title="Send" onPress={handleSendComment} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
  },
  commentItem: {
    marginBottom: 6,
  },
  user: {
    fontWeight: 'bold',
    color: '#333',
  },
  text: {
    color: '#555',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
});
