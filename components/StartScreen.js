import React, { useState, useContext, useEffect} from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { playButtonSound } from '../AudioHelper';
import SoundContext from '../SoundContext';
const { width, height } = Dimensions.get('window');
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import GradientContext from '../GradientContext';
import { MAP_OPTIONS } from './StylesScreen';
import {  getUnlockedMaps, getTotalScoreForTime, getGamesPlayed, getAllWordsUserFound } from '../StorageHelper';
import { scaledSize } from '../ScalingUtility';
import { adUnitIdBanner } from '../AdHelper';
//Starting screen before game screen
export default function StartScreen({navigation}) {
    const [selectedMap, setSelectedMap] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const {isSoundMuted} = useContext(SoundContext)
    const {gradientColors}= useContext(GradientContext);
    const [unlockedMapIds, setUnlockedMapIds] = useState([]);
    const [userStats, setUserStats] = useState({
    score: 0,
    gamesPlayed: 0,
    maxWordLength: 0
    });
    const availableMaps = MAP_OPTIONS.filter(mapOption => {
        if (unlockedMapIds.includes(mapOption.idx)) {
        return true;  // Already unlocked
        }
        if (mapOption.requiredScore && userStats.score < mapOption.requiredScore) {
        return false;
        }
        if (mapOption.requiredGamesPlayed && userStats.gamesPlayed < mapOption.requiredGamesPlayed) {
        return false;
        }
        if (mapOption.requiredWordLength && userStats.maxWordLength < mapOption.requiredWordLength) {
        return false;
        }
        return true;  // All criteria met
    });
    
    useEffect(() => {
        async function fetchUserStats() {
          const unlockedMaps = await getUnlockedMaps();
          
          const statsPromises = ['1 min', '3 min', '5 min'].map(async (time) => {
            const score = await getTotalScoreForTime(time);
            const gamesPlayed = await getGamesPlayed(time);
            return { score, gamesPlayed };
          });
      
          const allStats = await Promise.all(statsPromises);
          const totalScore = allStats.reduce((total, stat) => total + stat.score, 0);
          const totalGamesPlayed = allStats.reduce((total, stat) => total + stat.gamesPlayed, 0);
          const allWords = await getAllWordsUserFound();
          const maxWordLength = [...allWords].reduce((max, word) => Math.max(max, word.length), 0);
          
          setUserStats({
            score: totalScore,
            gamesPlayed: totalGamesPlayed,
            maxWordLength
          });
          
          setUnlockedMapIds(unlockedMaps);
        }
      
        fetchUserStats();
      }, []);
      


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
      const matrixSize = (idx === 0 ? 4 : idx == 1 || idx == 2 || idx == 3 ? 5 : 6); // 4x4, 5x5, 6x6
      const cellSizeTemp = ((120) - matrixSize * 4) / matrixSize; 
      const cellSize = scaledSize(cellSizeTemp);
      const cellStyle = {
          width: cellSize,
          height: cellSize,
          margin: 2,
          backgroundColor: 'gray'
      };
      const isCircleMap = (row, col) => {
        // Removing corners for circle map
        if (idx === 2) {
            return (row === 0 && (col === 0 || col === 4)) || 
                   (row === 4 && (col === 0 || col === 4)) ||
                   (row === 2 && col === 2);

        }
        if (idx === 5) {
            return (row === 0 && (col === 0 || col === 5)) || 
                   (row === 5 && (col === 0 || col === 5)) ||
                   (row === 2 && (col === 2 || col === 3)) || 
                   (row === 3 && (col === 2 || col === 3));
        }
        
        return false;
    };
    
    const isCoolPattern = (row, col) => {
        if (idx === 3) {
            return (row + col) % 2 === 0;
        }
        if (idx === 6) {
            return (row + col) % 2 === 0;
        }
        return false;
    };
    
      return (
          <View style={{ flexDirection: 'column', width: scaledSize(120), height: scaledSize(120), marginRight: scaledSize(30), opacity: selectedMap === idx ? 0.5 : 1 }}>
              {Array(matrixSize).fill(null).map((_, row) => (
                  <View style={{ flexDirection: 'row' }} key={row}>
                      {Array(matrixSize).fill(null).map((_, col) => 
                          isCircleMap(row, col) ? 
                              <View style={{...cellStyle, backgroundColor: 'transparent'}} key={col}></View> :
                              ((idx === 3 || idx==6) && !isCoolPattern(row, col)) ?
                              <View style={{...cellStyle, backgroundColor: 'transparent'}} key={col}></View> :
                              <View style={cellStyle} key={col}></View>
                      )}
                  </View>
              ))}
          </View>
      );
  }
  

    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={styles.header}>Select a Map:</Text>
                <ScrollView horizontal={true} style={styles.imageScroll} contentContainerStyle={{ flexDirection: 'row', alignItems: 'flex-start' }}>
  {availableMaps.map(map => (
    <TouchableOpacity key={map.idx} onPress={() => { setSelectedMap(selectedMap === map.idx ? null : map.idx); playButtonSound(isSoundMuted); }}>
      {renderShape(map.idx)}
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
        unitId={adUnitIdBanner}
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
        padding: scaledSize(20),
    },
    header: {
        fontFamily: 'ComicSerifPro',
        fontSize: scaledSize(38),
        marginVertical: scaledSize(50),
        color: 'white',
    },
    imageScroll: {
        flexGrow: 0,
        flexShrink: 1,
        paddingBottom: scaledSize(5),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scaledSize(20),
    },
    button: {
        borderRadius: scaledSize(15),
        width: '33%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scaledSize(20),
    },
    selectedButton: {
        borderRadius: scaledSize(15),
        width: '33%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scaledSize(20),
        opacity: 0.4 // Grayed out
    },
    startButton: {
        borderRadius: scaledSize(15),
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scaledSize(10),
    },
    glassButton: {
        padding: scaledSize(24),
        borderRadius: scaledSize(15),
        minWidth: '100%',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: scaledSize(1),
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'ComicSerifPro',
        color: '#fff',
        fontSize: scaledSize(24),
    },
    adBanner: {
        marginTop: scaledSize(35),
        alignItems: 'center'
    }
});
