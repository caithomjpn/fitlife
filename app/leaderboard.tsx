import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Layout from '../components/Layout';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';

export default function Leaderboard() {
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const [friendsData, setFriendsData] = useState<any[]>([]);
  const [goalData, setGoalData] = useState<any[]>([]);
  const [myGoal, setMyGoal] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const myRef = doc(db, 'users', currentUser.uid);
      const mySnap = await getDoc(myRef);
      const myData = mySnap.data();
      const myFriends = myData?.friends || [];
      const myGoal = myData?.goal || null;
      setMyGoal(myGoal);

      const allUsersSnap = await getDocs(collection(db, 'users'));
      const allUsers = allUsersSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Anonymous',
        xp: doc.data().xp || 0,
        goal: doc.data().goal || '',
      }));

      const friendsList = allUsers
        .filter(u => myFriends.includes(u.id))
        .sort((a, b) => b.xp - a.xp);

      const goalList = allUsers
        .filter(u => u.goal === myGoal)
        .sort((a, b) => b.xp - a.xp);

      setFriendsData(friendsList);
      setGoalData(goalList);
    };

    fetchLeaderboard();
  }, []);

  const renderItem = (item: any, index: number) => (
    <View style={[styles.item, { backgroundColor: Colors.background }]}>
      <Text style={[styles.rank, { color: Colors.secondary }]}>#{index + 1}</Text>
      <Text style={[styles.name, { color: Colors.textDark }]}>{item.name}</Text>
      <Text style={[styles.xp, { color: Colors.textDark }]}>{item.xp} XP</Text>
    </View>
  );

  return (
    <Layout>
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <Text style={[styles.title, { color: Colors.primary }]}>🏅 Friends Leaderboard</Text>
        {friendsData.length === 0 ? (
          <Text style={{ color: Colors.textDark }}>No friends to display.</Text>
        ) : (
          <FlatList
            data={friendsData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderItem(item, index)}
          />
        )}

        <Text style={[styles.title, { color: Colors.primary, marginTop: 20 }]}>
          🎯 Goal Leaderboard {myGoal ? `(${myGoal})` : ''}
        </Text>
        {goalData.length === 0 ? (
          <Text style={{ color: Colors.textDark }}>No users found for your goal.</Text>
        ) : (
          <FlatList
            data={goalData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderItem(item, index)}
          />
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 40,
  },
  name: {
    fontSize: 16,
    flex: 1,
  },
  xp: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});
