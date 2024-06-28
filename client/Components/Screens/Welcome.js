import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { FontAwesome } from '@expo/vector-icons';
import SoundContext from '../../Context/SoundContext';
import GradientContext from "../../Context/GradientContext";
import HapticContext from "../../Context/HapticContext";
import { playButtonSound } from '../../Helper/AudioHelper';
import { scaledSize } from "../../Helper/ScalingHelper";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get("window");

export default function Welcome({ navigation }) {
  const { isSoundMuted, setIsSoundMuted } = useContext(SoundContext);
  const { gradientColors } = useContext(GradientContext);
  const { isHapticEnabled, setIsHapticEnabled } = useContext(HapticContext);

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.overlayContainer}>
        <Text style={styles.titleText}>Welcome to Word Twirl!</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => { navigation.navigate("Login"); playButtonSound(isSoundMuted); }}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
            <View style = {styles.iconWrapper}>      
            <FontAwesome name="sign-in" size={scaledSize(38)} color="#fff" />
            </View>
              <Text style={styles.buttonText}>Log in</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => { navigation.navigate("SignUp"); playButtonSound(isSoundMuted); }}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
            <View style = {styles.iconWrapper}>      
            <FontAwesome name="user-plus" size={scaledSize(38)} color="#fff" />
            </View>
              <Text style={styles.buttonText}>Sign up</Text>
            </BlurView>
          </TouchableOpacity>

        </View>
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
    marginTop: scaledSize(100),
    color: "#fff",
    textShadowOffset: { width: scaledSize(2), height: scaledSize(2) },
    textShadowRadius: scaledSize(3),
    textShadowColor: "#333",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flex: 1,
    marginBottom: scaledSize(120)
  },
  button: {
    height: scaledSize(80),
    borderRadius: scaledSize(15),
    minWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scaledSize(25),
  },
  glassButton: {
    height: '100%',
    borderRadius: scaledSize(15),
    minWidth: "84.2%",
    maxWidth: "84.2%", 
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: scaledSize(1),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row'
  },
  buttonText: {
    fontFamily: "ComicSerifPro",
    color: "#fff",
    fontSize: scaledSize(40),
    padding: 0
  },
  iconWrapper: {
    marginRight: scaledSize(10),
    marginBottom: scaledSize(4)
     
  }
});
