import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Rules from "./Rules";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { playButtonSound } from '../AudioHelper';
import { FontAwesome } from '@expo/vector-icons';
import SoundContext from '../SoundContext';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType } from 'react-native-google-mobile-ads';



const { width, height } = Dimensions.get("window");

export default function Main({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isSoundMuted, setIsSoundMuted, isMusicMuted, setIsMusicMuted } = useContext(SoundContext);
  



  const generateRandomLetter = () => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return charset.charAt(Math.floor(Math.random() * charset.length));
  };

  const numberOfRows = 12;
  const lettersPerRow = 50;
  const letters = new Array(numberOfRows)
    .fill([])
    .map(() =>
      new Array(lettersPerRow).fill("").map(() => generateRandomLetter()),
    );

  const animationRefs = useRef(
    new Array(numberOfRows)
      .fill()
      .map((_, idx) => ({
        animValue: new Animated.Value(0),
        direction: idx % 2 === 0 ? 1 : -1,
      })),
  ).current;

  useEffect(() => {
    animationRefs.forEach((ref, index) => {
      const speed = 5000; // 10 second

      Animated.loop(
        Animated.sequence([
          Animated.timing(ref.animValue, {
            toValue: ref.direction,
            duration: speed,
            useNativeDriver: true,
          }),
          Animated.timing(ref.animValue, {
            toValue: 0,
            duration: speed,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);

  return (
    <LinearGradient colors={["#2E3192", "#1BFFFF"]} style={styles.container}>
      {letters.map((row, rowIndex) => (
        <Animated.View
          key={rowIndex}
          style={[
            styles.letterRow,
            {
              transform: [
                {
                  translateX: animationRefs[rowIndex]?.animValue?.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-height / 2, height / 2],
                  }),
                },
              ],
              zIndex: 0, // Ensure rows are behind the title and buttons
            },
          ]}
        >
          {row.map((letter, letterIndex) => (
            <Text key={letterIndex} style={styles.letter}>
              {letter}
            </Text>
          ))}
        </Animated.View>
      ))}

      <View style={[styles.overlayContainer, { zIndex: 1 }]}>
        <Text style={styles.titleText}>Word Twirl</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {navigation.navigate("Start Screen"); playButtonSound(isSoundMuted)}}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
              <Text style={styles.buttonText}>Start</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {setModalVisible(true);playButtonSound(isSoundMuted)}}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
              <Text style={styles.buttonText}>Rules</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>{navigation.navigate("Stats"); playButtonSound(isSoundMuted)}}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
              <Text style={styles.buttonText}>Stats</Text>
            </BlurView>
          </TouchableOpacity>
         
  
          <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButtonContainer} onPress={() => {
            setIsSoundMuted(!isSoundMuted);
            playButtonSound(isSoundMuted); // play sound if you want feedback on mute toggle
        }}>
            <BlurView intensity={50} tint="light" style={[styles.glassButton, styles.iconGlassButton]}>
                <FontAwesome name={isSoundMuted ? 'volume-off' : 'volume-up'} size={50} color="#fff" />
            </BlurView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButtonContainer} onPress={() => {
            setIsMusicMuted(!isMusicMuted);
            playButtonSound(isSoundMuted); // play sound if you want feedback on mute toggle
        }}>
            <BlurView intensity={40} tint="light" style={[styles.glassButton, styles.iconGlassButton]}>
                <FontAwesome name={isMusicMuted ? 'music' : 'music'} size={50} color={isMusicMuted ? 'gray' : '#fff'} />
            </BlurView>
        </TouchableOpacity>
    </View>

        </View>
        <View style ={{marginBottom:35}}>
        <BannerAd 
        unitId={TestIds.BANNER}
        size={BannerAdSize.LARGE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true
        }}
      />
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
    padding: 16,
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
    height: height / 10,
    alignItems: "center",
  },
  letter: {
    fontSize: 50,
    color: "rgba(255,255,255,0.25)",
    opacity: 0.5,
    marginHorizontal: 10,
    fontFamily: "ComicSerifPro",
  },
  titleText: {
    fontFamily: "ComicSerifPro",
    fontSize: 65,
    marginTop: 100,
    color: "#fff",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
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
    height: 100,
    borderRadius: 15,
    minWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  glassButton: {
    padding: 24,
    borderRadius: 15,
    minWidth: "90%",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "ComicSerifPro",
    color: "#fff",
    fontSize: 40,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '90%',
    marginBottom: 25,
  },
  iconButtonContainer: {
    flex: 1,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal:12.5
  },
  iconGlassButton: {
    width: '100%', 
    height: '100%',
    padding: 24,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


