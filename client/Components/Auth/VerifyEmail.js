import React, { useEffect, useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FIREBASE_AUTH, FIRESTORE } from "../../Firebase/FirebaseConfig";
import AuthContext from '../../Context/AuthContext';
import { playButtonSound } from '../../Helper/AudioHelper';
import { scaledSize } from "../../Helper/ScalingHelper";
import SoundContext from '../../Context/SoundContext';
import GradientContext from "../../Context/GradientContext";
import { sendEmailVerification } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const VerifyEmail = ({ route, navigation }) => {
  const { user } = route.params;
  const { isSoundMuted } = useContext(SoundContext);
  const { gradientColors } = useContext(GradientContext);
  const { login } = useContext(AuthContext);
  const [lastVerificationTime, setLastVerificationTime] = useState(null);

  useEffect(() => {
    // Send verification email once when component is mounted
    const sendVerification = async () => {
      try {
        await sendEmailVerification(user);
        setLastVerificationTime(new Date().getTime());
        Alert.alert("Success", "Verification email sent!");
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Failed to send verification email.");
      }
    };

    sendVerification();

    const interval = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        fetchUserDetails(user.uid);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE, "users", userId));
      if (userDoc.exists()) {
        const { username, email } = userDoc.data();
        login(userId, username, email);
      } else {
        console.error("User document does not exist.");
        Alert.alert("Error", "User details not found. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching user details: ", error);
      Alert.alert("Error", "Failed to fetch user details.");
    }
  };

  const resendVerificationEmail = async () => {
    const currentTime = new Date().getTime();
    if (lastVerificationTime && (currentTime - lastVerificationTime < 60000)) {
      Alert.alert("Error", "Please wait before retrying.");
      return;
    }

    try {
      await sendEmailVerification(user);
      setLastVerificationTime(currentTime);
      Alert.alert("Success", "Verification email resent!");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to resend verification email.");
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.overlayContainer}>
        <Text style={styles.titleText}>Verify Your Email</Text>
        <Text style={styles.infoText}>A verification email has been sent to {user.email}!</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.activityIndicator} />
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => { playButtonSound(isSoundMuted); resendVerificationEmail(); }}
        >
          <Text style={styles.buttonText}>Resend Verification Email</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

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
    fontSize: scaledSize(38),
    marginBottom: scaledSize(40),
    color: "#fff",
    textShadowOffset: { width: scaledSize(2), height: scaledSize(2) },
    textShadowRadius: scaledSize(3),
    textShadowColor: "#333",
    textAlign: "center",
  },
  infoText: {
    fontFamily: "ComicSerifPro",
    fontSize: scaledSize(18),
    color: "#fff",
    textAlign: "center",
    marginBottom: scaledSize(20),
  },
  activityIndicator: {
    marginBottom: scaledSize(20),
  },
  button: {
    marginBottom: scaledSize(20),
    height: scaledSize(50),
    borderRadius: scaledSize(10),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: scaledSize(1),
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  buttonText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: scaledSize(20),
  },
});

export default VerifyEmail;
