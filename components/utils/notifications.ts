import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// 🔔 通知のスケジューリング（ゴールリマインダー用）
export const scheduleGoalReminder = async (data: any, enable: boolean) => {
  if (Platform.OS === 'web') return; // ✅ Webではスキップ
  if (!enable) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎯 Time to check your goals!',
      body: 'Stay on track and complete your fitness goals today!',
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
      type: 'calendar',
    } as Notifications.CalendarTriggerInput, // ✅ 型指定が必要
  });
};

// 🔕 通知のキャンセル
export const cancelGoalReminder = async () => {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const createNotification = async (
  targetUserId: string,
  fromUserId: string,
  fromUserName: string,
  type: 'like' | 'friend_request' | 'friend_accept' | 'comment',
  extraData: any = {}
) => {
  const notiRef = doc(
    db,
    'users',
    targetUserId,
    'notifications',
    `${Date.now()}-${Math.random()}`
  );

  const payload = {
    fromUserId,
    fromUserName,
    type,
    createdAt: serverTimestamp(),
    read: false,
    ...extraData,
  };

  await setDoc(notiRef, payload);
};
