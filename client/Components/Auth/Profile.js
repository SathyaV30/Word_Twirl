import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIRESTORE } from "../../Firebase/FirebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import SoundContext from '../../Context/SoundContext';
import GradientContext from "../../Context/GradientContext";
import { scaledSize } from "../../Helper/ScalingHelper";
import AuthContext from '../../Context/AuthContext';
import ProfileActions from './ProfileActions';


const { width, height } = Dimensions.get("window");

export default function Profile({ navigation }) {
  const { isSoundMuted } = useContext(SoundContext);
  const { gradientColors } = useContext(GradientContext);
  const { logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(FIRESTORE, "users", user.uid));
        setProfileData(userDoc.data());
      }
    };
    fetchProfileData();
  }, []);


  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.overlayContainer}>
        <Text style={styles.titleText}>Profile</Text>
        {profileData ? (
          <View style={styles.profileContainer}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{profileData.username}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profileData.email}</Text>
          </View>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}

        <ProfileActions navigation={navigation} />
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
  profileContainer: {
    width: '80%',
    paddingHorizontal: scaledSize(30),
    marginBottom: scaledSize(20),
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: scaledSize(10),
    padding: scaledSize(20),
  },
  label: {
    fontFamily: "ComicSerifPro",
    fontSize: scaledSize(20),
    color: "#fff",
    marginBottom: scaledSize(5),
  },
  value: {
    fontFamily: "ComicSerifPro",
    fontSize: scaledSize(24),
    color: "#fff",
    marginBottom: scaledSize(20),
  },
  loadingText: {
    fontFamily: "ComicSerifPro",
    fontSize: scaledSize(24),
    color: "#fff",
  },
  signOutButton: {
    marginTop: scaledSize(20),
    padding: scaledSize(12),
    borderRadius: scaledSize(10),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: scaledSize(1),
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: scaledSize(20),
  },
});
