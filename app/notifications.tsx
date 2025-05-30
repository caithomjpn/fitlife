import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Layout from '../components/Layout';
import moment from 'moment';
import { useRouter } from 'expo-router';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';

export default function Notifications() {
  const [groupedNotifications, setGroupedNotifications] = useState<{ [date: string]: any[] }>({});
  const router = useRouter();
  const { theme } = useTheme(); // ✅ フックは関数の中に
  const Colors = getColors(theme);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = collection(db, 'users', user.uid, 'notifications');
    const q = query(ref, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          createdAt: d.createdAt,
          fromUserName: d.fromUserName,
          type: d.type,
          read: d.read,
        };
      });

      const grouped: { [date: string]: any[] } = {};
      data.forEach((item) => {
        const date = moment(item.createdAt?.toDate()).format('YYYY-MM-DD');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      });

      setGroupedNotifications(grouped);
    });

    return () => unsubscribe();
  }, []);

  const renderText = (item: any) => {
    switch (item.type) {
      case 'like':
        return `${item.fromUserName} liked your post.`;
      case 'friend_request':
        return `${item.fromUserName} sent you a friend request.`;
      case 'friend_accept':
        return `${item.fromUserName} accepted your friend request.`;
      default:
        return 'New notification';
    }
  };

  return (
    <Layout>
      <Text style={[styles.title, { color: Colors.primary }]}>🔔 Notifications</Text>

      {Object.keys(groupedNotifications).map((date) => (
        <View key={date} style={styles.group}>
          <Text style={[styles.dateHeader, { color: Colors.secondary }]}>
            {moment(date).format('MMM D, YYYY')}
          </Text>
          {groupedNotifications[date].map((item) => (
            <View key={item.id} style={[styles.item, { backgroundColor: Colors.background }]}>
              <Text
                style={[
                  styles.text,
                  { color: Colors.textDark },
                  !item.read && styles.unread,
                ]}
              >
                {renderText(item)}
              </Text>
              <Text style={styles.date}>{moment(item.createdAt?.toDate()).format('HH:mm')}</Text>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: Colors.primary }]}
        onPress={() => router.push('/social')}
      >
        <Text style={styles.backButtonText}>⬅ Back to Social</Text>
      </TouchableOpacity>
    </Layout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  group: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  item: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  unread: {
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
