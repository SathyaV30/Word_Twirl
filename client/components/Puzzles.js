import React, {useContext} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { scaledSize } from '../ScalingUtility';
import GradientContext from '../GradientContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { adUnitIdBanner } from '../AdHelper';
import { playButtonSound } from '../AudioHelper';
import SoundContext from '../SoundContext';

/* Coming Soon */
export default function Puzzles({ navigation }) {
    const { gradientColors } = useContext(GradientContext); 
    const { isSoundMuted } = useContext(SoundContext)
    const renderItem = ({ item }) => (
      <TouchableOpacity style={styles.button} onPress={() => {  navigation.navigate('Level', { level: item });
    playButtonSound(isSoundMuted)
    }}>
        <BlurView intensity={50} tint="light" style={styles.glassButton}>
          <Text style={styles.buttonText}>{item}</Text>
        </BlurView>
      </TouchableOpacity>
    );
  
    return (
      <LinearGradient colors={gradientColors} style={styles.container}>
        <SafeAreaView style={styles.safeAreaContainer}>
        <Text style = {styles.header}>Create a New Game</Text>




        
        <Text style = {styles.header}>Or choose an existing game</Text>
        </SafeAreaView>
        <View style ={{marginBottom:scaledSize(30), alignSelf:'center'}}>
        <BannerAd 
        unitId={adUnitIdBanner}
        size={BannerAdSize.LARGE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true
        }}
      />
      </View>
      </LinearGradient>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: scaledSize(12),
    },
    row: {
      flex: 1,
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    button: {
      height: scaledSize(80),
      width: scaledSize(80),
      borderRadius: scaledSize(15),
      alignItems: 'center',
      justifyContent: 'center',

    },
    glassButton: {
      height: '100%',
      width: '100%',
      borderRadius: scaledSize(15),
      borderColor: 'transparent',
      borderWidth: scaledSize(1),
      alignItems: 'center',
      justifyContent: 'center',
    
    },
    buttonText: {
      fontFamily: 'ComicSerifPro',
      color: '#fff',
      fontSize: scaledSize(38),
    },
    safeAreaContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
        fontFamily: 'ComicSerifPro',
        fontSize: scaledSize(45),
        color: 'white',
        textAlign: 'center',         // center the header text
        marginVertical: scaledSize(50),
    }
  });
  
