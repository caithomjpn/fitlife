import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image,
} from 'react-native';
import {
  collection, addDoc, query, orderBy, onSnapshot, Timestamp,
  doc, updateDoc, getDoc, getDocs,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db, storage } from '../firebaseConfig';
import Layout from '../components/Layout';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';
import { createNotification } from '../components/utils/notifications';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import uuid from 'react-native-uuid';

export default function Socials() {
  const { theme } = useTheme();
  const Colors = getColors(theme);
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const user = auth.currentUser;
const [filterMode, setFilterMode] = useState<'all' | 'goal' | 'friends'>('all');
const [friendIds, setFriendIds] = useState<string[]>([]);

  type Post = {
    id: string;
    uid: string;
    name: string;
    text: string;
    createdAt: Timestamp;
    likes: string[];
    imageUrl?: string;
    commentCount?: number;
  };

useEffect(() => {
  const fetchGoalAndPosts = async () => {
    if (!user) return;
    console.log('👤 Current user:', user.uid);

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const myGoal = userSnap.exists() ? userSnap.data().goal : null;
    const myFriends = userSnap.exists() ? userSnap.data().friends || [] : [];
    setUserGoal(myGoal);
    setFriendIds(myFriends);

    console.log('🎯 My Goal:', myGoal);
    console.log('👫 My Friends:', myFriends);

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allPosts: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, 'id'>),
      }));

      console.log('🧾 All Posts Fetched:', allPosts.length);

      const enriched = await Promise.all(
        allPosts.map(async (post) => {
          const authorRef = doc(db, 'users', post.uid);
          const snap = await getDoc(authorRef);
          const authorGoal = snap.exists() ? snap.data().goal : null;

          const commentsRef = collection(db, 'posts', post.id, 'comments');
          const commentsSnap = await getDocs(commentsRef);
          const commentCount = commentsSnap.size;

          return {
            ...post,
            commentCount,
            authorGoal,
          };
        })
      );

      console.log('✨ Filter Mode:', filterMode);

      const finalPosts = enriched.filter((post) => {
        if (filterMode === 'goal' && myGoal) {
          return post?.authorGoal === myGoal;
        } else if (filterMode === 'friends') {
          return friendIds.includes(post.uid);
        }
        return true;
      });

      console.log('✅ Final Posts to Display:', finalPosts.length);
      setPosts(finalPosts.filter(Boolean));
    });

    return () => unsubscribe();
  };

  fetchGoalAndPosts();
}, [filterMode]);



const handlePost = async () => {
  if (!user || !text.trim()) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  let nameFromProfile = 'Anonymous';
  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.name) nameFromProfile = userData.name;
  }

  const newPost = {
    uid: user.uid,
    name: nameFromProfile,
    text: text.trim(),
    createdAt: Timestamp.now(),
    likes: [],
  };

  await addDoc(collection(db, 'posts'), newPost);
  setText('');
};


  const toggleLike = async (postId: string, likes: string[] = [], postOwnerUid: string) => {
    if (!user) return;
    const liked = likes.includes(user.uid);
    const updatedLikes = liked
      ? likes.filter((uid) => uid !== user.uid)
      : [...likes, user.uid];
    await updateDoc(doc(db, 'posts', postId), { likes: updatedLikes });

    if (!liked && postOwnerUid !== user.uid) {
      await createNotification(
        postOwnerUid,
        user.uid,
        user.displayName || 'Anonymous',
        'like',
        { postId }
      );
    }
  };



  const renderPost = ({ item }: any) => {
  const liked = item.likes?.includes(user?.uid);
  return (
    <View style={[styles.post, { backgroundColor: Colors.background }]}>
      <Text style={[styles.postName, { color: Colors.textDark }]}>{item.name}</Text>
      <Text style={[styles.postText, { color: Colors.textDark }]}>{item.text}</Text>
      <Text style={styles.postDate}>{item.createdAt?.toDate().toLocaleString()}</Text>
      <Text style={{ color: Colors.textDark, marginTop: 4 }}>
        💬 {item.commentCount ?? 0} {item.commentCount === 1 ? 'comment' : 'comments'}
      </Text>
      <TouchableOpacity onPress={() => toggleLike(item.id, item.likes || [], item.uid)}>
        <Text style={{ color: liked ? 'red' : Colors.primary }}>
          {liked ? '❤️ Liked' : '🤍 Like'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push(`/comments/${item.id}`) as any}>
        <Text style={{ color: Colors.primary, marginTop: 6 }}>💬 View Comments</Text>
      </TouchableOpacity>
    </View>
  );
};
return (
  <Layout>
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      ListHeaderComponent={
        <>
          <Text style={[styles.title, { color: Colors.primary }]}>💬 Social Feed</Text>
          <TextInput
            style={[styles.input, { borderColor: Colors.primary, backgroundColor: Colors.background, color: Colors.textDark }]}
            placeholder="What's on your mind?"
            placeholderTextColor={Colors.textDark}
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary }]} onPress={handlePost}>
            <Text style={styles.buttonText}>➕ Post</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary }]} onPress={() => router.push('/friends')}>
            <Text style={styles.buttonText}>👥 Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary }]} onPress={() => router.push('/leaderboard')}>
            <Text style={styles.buttonText}>🏆 View Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary }]} onPress={() => router.push('/notifications')}>
            <Text style={styles.buttonText}>🔔 View Notifications</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
            <TouchableOpacity onPress={() => setFilterMode('all')}>
              <Text style={{ color: filterMode === 'all' ? Colors.primary : Colors.textDark }}>🌍 All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterMode('goal')}>
              <Text style={{ color: filterMode === 'goal' ? Colors.primary : Colors.textDark }}>🎯 By Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterMode('friends')}>
              <Text style={{ color: filterMode === 'friends' ? Colors.primary : Colors.textDark }}>👫 Friends</Text>
            </TouchableOpacity>
          </View>
        </>
      }
    />
  </Layout>
);
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  post: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  postName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  postText: {
    fontSize: 16,
  },
  postDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
});
