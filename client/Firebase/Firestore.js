import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIRESTORE } from './FirebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const saveData = async (userId, key, value) => {
  try {
    const userDocRef = doc(FIRESTORE, 'users', userId);
    await setDoc(userDocRef, { [key]: value }, { merge: true });
  } catch (error) {
    console.error("Error saving data: ", error);
  }
};

export const getData = async (userId, key) => {
  try {
  
    const userDocRef = doc(FIRESTORE, 'users', userId);
    const documentSnapshot = await getDoc(userDocRef);
    if (documentSnapshot.exists()) {
      const data = documentSnapshot.data();
      if (data[key]) {
        return data[key];
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return null;
  }
};
