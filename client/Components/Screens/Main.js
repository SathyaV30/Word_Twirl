import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Rules from "./Rules";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {  playButtonSound } from '../../Helper/AudioHelper';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import SoundContext from '../../Context/SoundContext';
import GradientContext from "../../Context/GradientContext";
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { scaledSize } from "../../Helper/ScalingHelper";
import { adUnitIdBanner } from "../../Helper/AdHelper";
import HapticContext from "../../Context/HapticContext";
const { width, height } = Dimensions.get("window");
import Toast from 'react-native-toast-message';

//Main menu screen
export default function Main({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isSoundMuted, setIsSoundMuted } = useContext(SoundContext);
  const {gradientColors} = useContext(GradientContext);
  const {isHapticEnabled, setIsHapticEnabled} = useContext(HapticContext);
  
  
  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={[styles.overlayContainer, { zIndex: 1 }]}>
        <Text style={styles.titleText}>Word Twirl</Text>

        <View style={styles.buttonsContainer}>
        <TouchableOpacity
  style={styles.button}
  onPress={() => { navigation.navigate("Start Screen", { multiplayer: false }); playButtonSound(isSoundMuted) }}
>
  <BlurView intensity={50} tint="light" style={styles.glassButton}>
    <View style={styles.iconWrapper}>
      <FontAwesome name="gamepad" size={scaledSize(38)} color="#fff" />
    </View>
    <Text style={styles.buttonText}>Classic</Text>
  </BlurView>
</TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => { navigation.navigate("Start Screen", { multiplayer: true }); playButtonSound(isSoundMuted) }}
    >
      <BlurView intensity={50} tint="light" style={styles.glassButton}>
        <View style={styles.iconWrapper}>
          <FontAwesome name="globe" size={scaledSize(38)} color="#fff" /> 
        </View>
        <Text style={styles.buttonText}>Multiplayer</Text>
      </BlurView>
    </TouchableOpacity>


          <TouchableOpacity
            style={styles.button}
            onPress={() => {setModalVisible(true);playButtonSound(isSoundMuted)}}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
            <View style = {styles.iconWrapper}>      
            <FontAwesome name="gavel" size={scaledSize(38)} color="#fff" />
            </View>
              <Text style={styles.buttonText}>Rules</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>{navigation.navigate("Stats"); playButtonSound(isSoundMuted)}}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
              <View style = {styles.iconWrapper}>      
              <FontAwesome name="bar-chart" size={scaledSize(38)} color="#fff" />
              </View>   
              <Text style={styles.buttonText}>Stats</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>{navigation.navigate("Profile"); playButtonSound(isSoundMuted)}}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
              <View style = {styles.iconWrapper}>      
              <FontAwesome name="user" size={scaledSize(38)} color="#fff" />
              </View>   
              <Text style={styles.buttonText}>Profile</Text>
            </BlurView>
          </TouchableOpacity>
  
          <View style={styles.iconsContainer}>
          <TouchableOpacity style={styles.iconButtonContainer} onPress={() => {
    const original = isSoundMuted;
    setIsSoundMuted(!isSoundMuted);
    playButtonSound(isSoundMuted); 
    Toast.show({
      type: 'success',
      position: 'top',
      visibilityTime: 1000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
      text2: original ? "Sound unmuted!" : "Sound muted!"
    });
    
}}>
            <BlurView intensity={50} tint="light" style={[styles.glassButton, styles.iconGlassButton]}>
                <FontAwesome name={isSoundMuted ? 'volume-off' : 'volume-up'} size={scaledSize(38)}color={isSoundMuted ? 'gray' : '#fff'} />
            </BlurView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButtonContainer} onPress={() => {
            playButtonSound(isSoundMuted); 
            setIsHapticEnabled(!isHapticEnabled);
            const original = isHapticEnabled;
            setIsHapticEnabled(!isHapticEnabled);
            Toast.show({
              type: 'success',
              position: 'top',
              visibilityTime: 1000,
              autoHide: true,
              topOffset: 30,
              bottomOffset: 40,
              text2: !original ? "Haptic feedback enabled!" : "Haptic feedback disabled!"
            });
        }}>
            <BlurView intensity={50} tint="light" style={[styles.glassButton, styles.iconGlassButton]}>
            <FontAwesome5 name='hand-pointer' size={scaledSize(38)}color= {!isHapticEnabled ? 'gray' : '#fff'} />
            </BlurView>
        </TouchableOpacity>
    </View>


        </View>
   
      </View>




      <Rules modalVisible={modalVisible} setModalVisible={setModalVisible} />
    </LinearGradient>
  );
}
export const styles = StyleSheet.create({
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
  letterRow: {
    flexDirection: "row",
    height: scaledSize(height / 10),
    alignItems: "center",
  },
  letter: {
    fontSize: scaledSize(60),
    color: "rgba(255,255,255,0.25)",
    opacity: 0.5,
    fontFamily: "ComicSerifPro",
  },
  titleText: {
    fontFamily: "ComicSerifPro",
    fontSize: scaledSize(65),
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
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: scaledSize(1),
    alignItems: "center",
    justifyContent: "center",
    flexDirection:'row',
    boxShadow: 'rgb(51, 51, 51) 0px 0px 0px 3px;'
  },
  buttonText: {
    fontFamily: "ComicSerifPro",
    color: "#fff",
    fontSize: scaledSize(38),
    padding:0
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '84.2%', 
    marginBottom: scaledSize(25),
  },
  iconButtonContainer: {
    flex: 1,
    height: scaledSize(80),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,  
  },
  iconGlassButton: {
    width: '100%', 
    height: '100%',
    padding: scaledSize(18),
    borderRadius: scaledSize(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight:scaledSize(10),
    marginBottom:scaledSize(5),
  }
});



