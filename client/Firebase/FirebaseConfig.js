// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJ4BOhgixCfvRNUIstViNnv7LmWCf6DJQ",
  authDomain: "word-twirl.firebaseapp.com",
  projectId: "word-twirl",
  storageBucket: "word-twirl.appspot.com",
  messagingSenderId: "55115465789",
  appId: "1:55115465789:web:b9ecf82ab505c5decb5654",
  measurementId: "G-FZTH4GZ1H2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

export { auth as FIREBASE_AUTH, db as FIRESTORE };