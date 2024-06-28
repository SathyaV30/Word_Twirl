import React, { useEffect, useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FIREBASE_AUTH } from "../../Firebase/FirebaseConfig";
import AuthContext from '../../Context/AuthContext';
import { playButtonSound } from '../../Helper/AudioHelper';
import { scaledSize } from "../../Helper/ScalingHelper";
import SoundContext from '../../Context/SoundContext';
import GradientContext from "../../Context/GradientContext";
import Toast from 'react-native-toast-message';
import { sendEmailVerification } from "firebase/auth";

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
        Toast.show({
          type: 'success',
          position: 'top',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
          text2: "Verification email sent to " + user.email
        });
      } catch (error) {
        console.log(error);
        Toast.show({
          type: 'errorTextSmall',
          position: 'top',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
          text2: "Failed to send verification email."
        });
      }
    };

    sendVerification();

    const interval = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        login(user.uid);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const resendVerificationEmail = async () => {
    const currentTime = new Date().getTime();
    if (lastVerificationTime && (currentTime - lastVerificationTime < 60000)) {
      Toast.show({
        type: 'error',
        position: 'top',
        visibilityTime: 1000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        text2: "Please wait before retrying."
      });
      return;
    }

    try {
      await sendEmailVerification(user);
      setLastVerificationTime(currentTime);

      Toast.show({
        type: 'success',
        position: 'top',
        visibilityTime: 1000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        text2: "Verification email resent!"
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        position: 'top',
        visibilityTime: 1000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        text2: "Failed to resend verification email."
      });
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.overlayContainer}>
        <Text style={styles.titleText}>Verify Your Email</Text>
        <Text style={styles.infoText}>A verification email has been sent to {user.email}. Please verify your email to continue. You will be automatically signed in once verified.</Text>
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
