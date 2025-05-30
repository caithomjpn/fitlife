import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const fetchWorkoutTemplates = async () => {
  const snapshot = await getDocs(collection(db, 'workoutTemplates'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
