import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SoundContext from '../../Context/SoundContext';
import GradientContext from "../../Context/GradientContext";
import HapticContext from "../../Context/HapticContext";
import { playButtonSound } from '../../Helper/AudioHelper';
import { scaledSize } from "../../Helper/ScalingHelper";
import { FIREBASE_AUTH, FIRESTORE } from "../../Firebase/FirebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification, deleteUser } from "firebase/auth";
import { doc, setDoc, getDocs, query, collection, where } from "firebase/firestore"; 
import AuthContext from '../../Context/AuthContext';

const { width, height } = Dimensions.get("window");

export default function SignUp({ navigation }) {
  const { isSoundMuted } = useContext(SoundContext);
  const { gradientColors } = useContext(GradientContext);
  const { isHapticEnabled } = useContext(HapticContext);
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const db = FIRESTORE;

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(username);
  };

  const signUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert(
        "Error",
        "Passwords do not match.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert(
        "Error",
        "Username cannot contain special characters or spaces.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if username already exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Username exists, delete the user
        await deleteUser(user);
        Alert.alert(
          "Error",
          "Username is already taken.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      // Username does not exist, proceed with setting up the user document
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email
      });

      // Navigate to the verification screen
      navigation.navigate('VerifyEmail', { user });

    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        'There was an error while signing up: ' + error.message,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.overlayContainer}>
        <Text style={styles.titleText}>Sign Up</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#aaa"
            onChangeText={setUsername}
            value={username}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            autoCapitalize="none"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={styles.submitButton} />
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => { playButtonSound(isSoundMuted); signUp(); }}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>Already have an account? Log in!</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scaledSize(16),
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: "ComicSerifPro",
    fontSize: scaledSize(60),
    marginBottom: scaledSize(40),
    color: "#fff",
    textShadowOffset: { width: scaledSize(2), height: scaledSize(2) },
    textShadowRadius: scaledSize(3),
    textShadowColor: "#333",
    textAlign: "center",
  },
  inputContainer: {
    width: '80%',
    paddingHorizontal: scaledSize(30),
    marginBottom: scaledSize(20),
    alignItems: "center",
  },
  input: {
    height: scaledSize(50),
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: scaledSize(1),
    borderRadius: scaledSize(10),
    paddingHorizontal: scaledSize(10),
    marginBottom: scaledSize(20),
    fontSize: scaledSize(18),
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
    fontFamily: "ComicSerifPro"
  },
  submitButton: {
    marginBottom: scaledSize(20),
    height: scaledSize(50),
    borderRadius: scaledSize(10),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: scaledSize(1),
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  submitButtonText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: scaledSize(20),
  },
  linkText: {
    fontFamily: "ComicSerifPro",
    color: "#fff",
    fontSize: scaledSize(18),
    marginTop: scaledSize(20),
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
