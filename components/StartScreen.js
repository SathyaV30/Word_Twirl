import React, { useState, useContext } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { playButtonSound } from '../AudioHelper';
import SoundContext from '../SoundContext';
const { width, height } = Dimensions.get('window');
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
export default function StartScreen({navigation}) {
    const [selectedMap, setSelectedMap] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const {isSoundMuted} = useContext(SoundContext)


    function startGame() {
        if (selectedMap === null && selectedTime === null) {
            Alert.alert("", "Please select a map and a time limit");
            return;
        } 
        if (selectedMap === null) {
            Alert.alert("", "Please select a map");
            return;
        } 
        if (selectedTime === null) {
            Alert.alert("", "Please select a time limit");
            return;
        }
        navigation.reset({
            index: 0,
            routes: [{
                name: 'Game',
                params: {
                    selectedMapIndex: selectedMap,
                    selectedTime: selectedTime,
                }
            }],
        });
     
    }

    function renderShape(idx) {
      const matrixSize = (idx === 0 ? 4 : 5); // 4x4 or 5x5
      const cellSize = (120 - matrixSize * 4) / matrixSize; // Adjusting for margins between cells
  
      const cellStyle = {
          width: cellSize,
          height: cellSize,
          margin: 2,
          backgroundColor: 'gray'
      };
  
      const isCircleMap = (row, col) => {
          // Removing corners for circle map
          return (idx === 2) && ((row === 0 && (col === 0 || col === 4)) || 
                                 (row === 4 && (col === 0 || col === 4)));
      };
  
      const isCoolPattern = (row, col) => {
          return (idx === 3) && ((row + col) % 2 === 0);
      };
  
      return (
          <View style={{ flexDirection: 'column', width: 120, height: 120, marginRight: 30, opacity: selectedMap === idx ? 0.5 : 1 }}>
              {Array(matrixSize).fill(null).map((_, row) => (
                  <View style={{ flexDirection: 'row' }} key={row}>
                      {Array(matrixSize).fill(null).map((_, col) => 
                          isCircleMap(row, col) ? 
                              <View style={{...cellStyle, backgroundColor: 'transparent'}} key={col}></View> :
                              (idx === 3 && !isCoolPattern(row, col)) ?
                              <View style={{...cellStyle, backgroundColor: 'transparent'}} key={col}></View> :
                              <View style={cellStyle} key={col}></View>
                      )}
                  </View>
              ))}
          </View>
      );
  }
  

    return (
        <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={styles.header}>Select a Map:</Text>
                <ScrollView horizontal={true} style={styles.imageScroll} contentContainerStyle={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    {Array(4).fill(null).map((_, idx) => (
                        <TouchableOpacity key={idx} onPress={() => { setSelectedMap(selectedMap === idx ? null : idx); playButtonSound(isSoundMuted); }}>
                        {renderShape(idx)}
                    </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.header}>Select a time limit:</Text>
                <View style={styles.buttonContainer}>
                    {['1 min', '3 min', '5 min'].map(time => (
                                               <TouchableOpacity key={time} style={selectedTime === time ? styles.selectedButton : styles.button} onPress={() => { setSelectedTime(selectedTime === time ? null : time); playButtonSound(isSoundMuted); }}>
                                               <BlurView intensity={50} tint="light" style={styles.glassButton}>
                                                   <Text style={styles.buttonText}>{time}</Text>
                                               </BlurView>
                                           </TouchableOpacity>
                   
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => { startGame(); playButtonSound(isSoundMuted); }}
                >
                    <BlurView intensity={50} tint="light" style={styles.glassButton}>
                        <Text style={styles.buttonText}>Start Game</Text>
                    </BlurView>
                </TouchableOpacity>
                <View style={styles.adBanner}>
    <BannerAd 
        unitId={TestIds.BANNER}
        size={BannerAdSize.LARGE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true
        }}
    />
</View>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontFamily: 'ComicSerifPro',
        fontSize: 38,
        marginVertical: 50,
        color: 'white',
    },
    imageScroll: {
        flexGrow: 0,
        flexShrink: 1,
        paddingBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    button: {
        borderRadius: 15,
        width: '33%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    selectedButton: {
        borderRadius: 15,
        width: '33%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        opacity: 0.4 // Grayed out
    },
    startButton: {
        borderRadius: 15,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    glassButton: {
        padding: 24,
        borderRadius: 15,
        minWidth: '100%',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'ComicSerifPro',
        color: '#fff',
        fontSize: 24,
    },
    adBanner: {
        marginTop:35,
        alignItems:'center'
    }
});
