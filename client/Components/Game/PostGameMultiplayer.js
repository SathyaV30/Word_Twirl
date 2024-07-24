import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { playButtonSound } from '../../Helper/AudioHelper';
import SoundContext from '../../Context/SoundContext';
import GradientContext from '../../Context/GradientContext';
import AuthContext from '../../Context/AuthContext';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { scaledSize } from '../../Helper/ScalingHelper';
import { adUnitIdBanner } from '../../Helper/AdHelper';
import io from 'socket.io-client';
import socket from '../../Helper/Socket';


export default function PostGameMultiplayer({ route, navigation }) {
  const { isSoundMuted } = useContext(SoundContext);
  const { gradientColors } = useContext(GradientContext);
  const { username } = useContext(AuthContext);
  const { allWords, foundWords, userScore, selectedTime, letters, wordsToPath, room } = route.params;
  const [opponentFoundWords, setOpponentFoundWords] = useState([]);
  const [opponentScore, setOpponentScore] = useState(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(true);
  const [sortedAllWords, setSortedAllWords] = useState([]);

  useEffect(() => {
    console.log(opponentFoundWords)
  }, [opponentFoundWords])

  useEffect(() => {
    console.log('Joining room: ' + room + ' with username: ' + username); 
    socket.emit('joinRoom', { room, username });
  
    socket.emit('postGameData', { room, foundWords, userScore });
    
    socket.on('opponentPostGameData', (opponentGameData) => {
      const opponentFoundWords = opponentGameData.foundWords;
      const opponentScore = opponentGameData.userScore;
      setOpponentFoundWords(opponentFoundWords);
      setOpponentScore(opponentScore);
      setWaitingForOpponent(false);
    });
  
    return () => {
      socket.off('opponentPostGameData');
    };
  }, []);

  

  const getPointValue = (word) => word.length ** 2;

  const sortedWords = Array.from(allWords).sort((a, b) => {
    const difference = b.length - a.length;
    return difference !== 0 ? difference : getPointValue(b) - getPointValue(a);
  });

  const sortedFoundWords = Array.from(foundWords).sort((a, b) => {
    const difference = b.length - a.length;
    return difference !== 0 ? difference : getPointValue(b) - getPointValue(a);
  });

  useEffect(() => {
    setSortedAllWords(sortedWords.map(word => {
      const foundByMe = foundWords.includes(word);
      const foundByOpponent = opponentFoundWords.includes(word);
      return { word, foundByMe, foundByOpponent };
    }));
  }, [foundWords, opponentFoundWords]);

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView>
        <View style={styles.mainContainer}>
          <Text style={styles.score}>My Score: {userScore}</Text>
          {waitingForOpponent ? (
            <Text style={styles.waitingText}>Waiting for opponent to finish...</Text>
          ) : (
            <Text style={styles.score}>Opponent Score: {opponentScore}</Text>
          )}
          <View style={styles.scrollViewsContainer}>
            <ScrollView style={[styles.halfWidthScrollView, styles.fixedHeightScrollView]}>
              <Text style={styles.allWords}>My Found Words</Text>
              {sortedFoundWords.map((word, index) => (
                <TouchableOpacity style={styles.wordContainer} key={index} onPress={() => navigation.navigate('WordDetailsScreen', { word, letters, wordsToPath, fromGame: true })}>
                  <Text style={styles.word}>{word}</Text>
                  <Text style={styles.points}>{getPointValue(word)} pts</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView style={[styles.halfWidthScrollView, styles.fixedHeightScrollView]}>
              <Text style={styles.allWords}>Opponent Found Words</Text>
              {opponentFoundWords.map((word, index) => (
                <TouchableOpacity style={styles.wordContainer} key={index} onPress={() => navigation.navigate('WordDetailsScreen', { word, letters, wordsToPath, fromGame: true })}>
                  <Text style={styles.word}>{word}</Text>
                  <Text style={styles.points}>{getPointValue(word)} pts</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <ScrollView style={[styles.halfWidthScrollView, styles.fixedHeightScrollView]}>
            <Text style={styles.allWords}>All Words</Text>
            {sortedAllWords.map((entry, index) => (
              <TouchableOpacity style={styles.wordContainer} key={index} onPress={() => navigation.navigate('WordDetailsScreen', { word: entry.word, letters, wordsToPath, fromGame: true })}>
                <Text style={[styles.word, entry.foundByMe ? styles.myWord : null, entry.foundByOpponent ? styles.opponentWord : null]}>
                  {entry.word}
                </Text>
                <Text style={styles.points}>{getPointValue(entry.word)} pts</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => { navigation.navigate('Start Screen', { type: true }); playButtonSound(isSoundMuted); }}>
              <BlurView intensity={50} tint="light" style={styles.glassButton}>
                <Text style={styles.buttonText}>New Game</Text>
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }]
              });
              playButtonSound(isSoundMuted);
            }}>
              <BlurView intensity={50} tint="light" style={styles.glassButton}>
                <Text style={styles.buttonText}>Main Menu</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
          <View style={{ height: 50, marginTop: scaledSize(20) }}>
            <BannerAd
              unitId={adUnitIdBanner}
              size={BannerAdSize.LARGE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  score: {
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(36)
  },
  waitingText: {
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(24),
    textAlign: 'center'
  },
  allWords: {
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(24),
    textAlign: 'center'
  },
  scrollViewsContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  halfWidthScrollView: {
    width: '30%',
    margin: scaledSize(10),
  },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: scaledSize(1),
    borderBottomColor: '#fff',
    paddingVertical: scaledSize(20),
  },
  word: {
    fontSize: scaledSize(20),
    color: '#fff',
    fontFamily: 'ComicSerifPro',
  },
  points: {
    fontSize: scaledSize(18),
    color: '#fff',
    fontFamily: 'ComicSerifPro'
  },
  myWord: {
    textDecorationLine: 'underline',
    textDecorationColor: 'blue',
  },
  opponentWord: {
    textDecorationLine: 'underline',
    textDecorationColor: 'red',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  glassButton: {
    width: scaledSize(350),
    height: scaledSize(60),
    padding: scaledSize(12),
    borderRadius: scaledSize(5),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: scaledSize(20),
    color: 'white',
    fontFamily: 'ComicSerifPro',
    textAlign: 'center',
  },
  button: {
    marginVertical: scaledSize(8),
  },
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: scaledSize(20)
  },
  fixedHeightScrollView: {
    height: scaledSize(555),
  },
});
