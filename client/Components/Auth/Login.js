import React, { useState, useContext, useRef } from "react";
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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AuthContext from '../../Context/AuthContext';

const { width, height } = Dimensions.get("window");

export default function Login({ navigation }) {
  const { isSoundMuted } = useContext(SoundContext);
  const { gradientColors } = useContext(GradientContext);
  const { isHapticEnabled } = useContext(HapticContext);
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const lastResetTime = useRef(null);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      await response.user.reload(); // Reload user to get the latest emailVerified status
      if (!response.user.emailVerified) {
        navigation.navigate('VerifyEmail', { user: response.user });
        Alert.alert(
          "Error",
          "Email is not verified. Please verify your email to continue.",
          [{ text: "OK" }]
        );
      } else {
        const userDoc = await getDoc(doc(FIRESTORE, 'users', response.user.uid));
        if (userDoc.exists()) {
          const { username, email } = userDoc.data();
          login(response.user.uid, username, email);
        } else {
          console.error('User document does not exist.');
          Alert.alert(
            "Error",
            "An error has occurred. Please try again.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "An error has occurred. Please make sure your credentials are correct.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const currentTime = new Date().getTime();
    if (lastResetTime.current && (currentTime - lastResetTime.current < 60000)) {
      Alert.alert(
        "Error",
        "Please wait before retrying.",
        [{ text: "OK" }]
      );
      return;
    }

    lastResetTime.current = currentTime;
    try {
      if (!email || !email.includes('@')) {
        Alert.alert(
          "Error",
          "Please enter a valid email in the input.",
          [{ text: "OK" }]
        );
      } else {
        await sendPasswordResetEmail(auth, email);
        Alert.alert(
          "Success",
          "Password reset email sent!",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "There was an error. Please make sure you have entered a valid email.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.overlayContainer}>
        <Text style={styles.titleText}>Log In</Text>

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
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            autoCapitalize="none"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={styles.submitButton} />
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => { playButtonSound(isSoundMuted); signIn(); }}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handlePasswordReset}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.linkText}>Don't have an account? Sign up!</Text>
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
