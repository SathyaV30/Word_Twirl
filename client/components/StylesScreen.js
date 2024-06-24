import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';
import GradientContext from '../GradientContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStatForKey, getAllWordsUserFound, TOTAL_SCORE_KEY_PREFIX, GAMES_PLAYED_KEY_PREFIX } from '../StorageHelper';
import { scaledSize } from '../ScalingUtility';
import { FontAwesome } from '@expo/vector-icons';

// test options

// const GRADIENT_OPTIONS = [
  //   { colors: ['#000000', '#000000'] },
  //   { colors: ['#E3242B', '#E3242B'], requiredScore: 0 },
  //   { colors: ['#2832c2', '#2832c2'], requiredScore: 0 },
  //   { colors: ['#276221', '#276221'], requiredScore: 0 },
  //   { colors: ['#33FF57', '#FF33D1'], requiredGamesPlayed: 0 },
  //   { colors: ["#8B4513", "#2F4F4F"], requiredGamesPlayed: 0 },
  //   { colors: ["#E55D87", "#5FC3E4"], requiredGamesPlayed : 0 },
  //   { colors: ['#2E3192', '#1BFFFF'], requiredWordLength : 0 },   
  //   { colors: ["#003973", "#E5E5BE"], requiredWordLength : 0 },
  //   { colors: ["#FFD700", "#4B0082"], requiredWordLength : 0 },   
  // ];
  
  // export const MAP_OPTIONS = [
  //     { idx: 0 },
  //     { idx: 1, requiredScore: 0 },
  //     { idx: 2, requiredScore: 0 },
  //     { idx: 5, requiredGamesPlayed: 0 },
  //     { idx: 4, requiredWordLength: 0 },
  //   ];
const GRADIENT_OPTIONS = [
  { colors: ['#2E3192', '#1BFFFF'] },
  { colors: ['#E3242B', '#E3242B'], requiredScore: 1000 },
  { colors: ['#2832c2', '#2832c2'], requiredScore: 5000 },
  { colors: ['#276221', '#276221'], requiredScore: 10000 },
  { colors: ['#33FF57', '#FF33D1'], requiredGamesPlayed: 25 },
  { colors: ["#8B4513", "#2F4F4F"], requiredGamesPlayed: 100 },
  { colors: ["#E55D87", "#5FC3E4"], requiredGamesPlayed : 500 },
  { colors: ['#4776E6', '#8E54E9'], requiredWordLength : 6 },   
  { colors: ["#003973", "#E5E5BE"], requiredWordLength : 8 },
  { colors: ["#FFD700", "#4B0082"], requiredWordLength : 10 },   
];
    
export const MAP_OPTIONS = [
  { idx: 0 },
  { idx: 1},
  { idx: 2 },
  { idx: 5},
  { idx: 4},
];





export default function StylesScreen() {
  const { gradientColors, setAppGradient } = useContext(GradientContext);
  const [totalScore, setTotalScore] = useState(0);
  const [longestWordLength, setLongestWordLength] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  useEffect(() => {
    async function fetchScoresAndWords() {
      const scores = await Promise.all([
        getStatForKey(TOTAL_SCORE_KEY_PREFIX + '1 min'),
        getStatForKey(TOTAL_SCORE_KEY_PREFIX + '3 min'),
        getStatForKey(TOTAL_SCORE_KEY_PREFIX + '5 min')
      ]);
      const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
      const allWords = await getAllWordsUserFound();
      const longestWord = Math.max(...Array.from(allWords).map(word => word.length));
      const gamesPlayed = await Promise.all([
        getStatForKey(GAMES_PLAYED_KEY_PREFIX + '1 min'),
        getStatForKey(GAMES_PLAYED_KEY_PREFIX + '3 min'),
        getStatForKey(GAMES_PLAYED_KEY_PREFIX + '5 min'),
      ]) 
      const totalGames = gamesPlayed.reduce((acc, curr) => acc + curr, 0);

      setTotalScore(totalScore);
      setLongestWordLength(longestWord);
      setGamesPlayed(totalGames);
    }
    
    fetchScoresAndWords();
  }, []);

  function renderShape(idx) {
    const matrixSize = (idx === 0 ? 4 : idx == 1 || idx == 2 || idx == 3 ? 5 : 6); // 4x4, 5x5, 6x6
    const cellSizeTemp = (90 - matrixSize * 4) / matrixSize; 
    const cellSize = scaledSize(cellSizeTemp);
    const cellStyle = {
        width: cellSize,
        height: cellSize,
        margin: 2,
        backgroundColor: 'gray'
    };
    const isCircleMap = (row, col) => {
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
        <View style={{ flexDirection: 'column', width: scaledSize(90), height: scaledSize(90)}}>
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

  const GradientPreview = ({ gradient, index }) => {
    let isDisabled = false;
    let progress = 1;
    let milestoneText = index === 0 ? 'Default Color' : "";
    let progressDetail = index === 0 ? 'Unlocked!' : "";
  

    if (gradient.requiredScore && index !== 0) {
      isDisabled = totalScore < gradient.requiredScore;
      progress = Math.min(totalScore / gradient.requiredScore, 1);
      milestoneText = `Score ${gradient.requiredScore} points`;
      progressDetail = (gradient.requiredScore - totalScore) > 0 
             ? `${gradient.requiredScore - totalScore} points left` 
             : 'Unlocked!';
    } else if (gradient.requiredWordLength && index !== 0) {
      isDisabled = longestWordLength < gradient.requiredWordLength;
      progress = isDisabled ? 0 : 1;
      milestoneText = `Find a ${gradient.requiredWordLength}-letter word`;
      progressDetail = !isDisabled ? 'Unlocked!' : '';
    } else if (gradient.requiredGamesPlayed && index !== 0) {
      isDisabled = gamesPlayed < gradient.requiredGamesPlayed;
      progress = Math.min(gamesPlayed / gradient.requiredGamesPlayed, 1);
      milestoneText = `Play ${gradient.requiredGamesPlayed} games`;
      progressDetail = (gradient.requiredGamesPlayed - gamesPlayed) > 0 
             ? `${gradient.requiredGamesPlayed - gamesPlayed} games left` 
             : 'Unlocked!';
    } 

    return (
      <View style={styles.gradientItem}>
        <TouchableOpacity 
          style={[styles.previewContainer, isDisabled && styles.disabled]}
          onPress={() => !isDisabled && setAppGradient(gradient.colors)}
          disabled={isDisabled}
        >
          <LinearGradient colors={gradient.colors} style={styles.preview} />
        </TouchableOpacity>
      
        <View style={styles.progressBarContainer}>
          <Progress.Bar progress={progress} width={scaledSize(100)} height={scaledSize(20)} color="white" />
          <Text style={styles.progressDetail}>{progressDetail}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.milestoneText}>{milestoneText}</Text>
        </View>
      </View>
    );
  };



  

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.tabs}>
  
          <View>
            <FlatList
              data={GRADIENT_OPTIONS}
              renderItem={({ item, index }) => <GradientPreview gradient={item} index={index} />} 
              keyExtractor={(item, index) => index.toString()}
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
  tabs: {
    flexDirection: 'row',
    marginBottom: scaledSize(20),
    width: '100%',
    justifyContent: 'space-around'
  },
  tab: {
    padding: scaledSize(10),
    alignItems: 'center',
    borderBottomWidth: scaledSize(2),
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#fff'
  },
  tabText: {
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(18)
  },
  activeTabText: {
    fontSize: scaledSize(20)
  },
  safeAreaContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: scaledSize(50),
  },
  header: {
    fontSize: scaledSize(24),
    fontFamily: 'ComicSerifPro',
    color: 'white',
    marginBottom: scaledSize(20),
    textAlign: 'center'
  },
  gradientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaledSize(15),
    maxWidth: '100%',
  },
  progressBarContainer: {
    marginHorizontal: scaledSize(10),
    alignItems: 'center',
  },
  progressDetail: {
    color: 'white',
    fontSize: scaledSize(10),
    fontFamily: 'ComicSerifPro',
    marginTop: scaledSize(3),
  },
  previewContainer: {
    marginHorizontal: scaledSize(20),
  },
  preview: {
    width: scaledSize(60),  
    height: scaledSize(60), 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaledSize(8),
    borderColor: 'grey',
    borderWidth: scaledSize(1)
  },
  disabled: {
    opacity: 0.3,
  },
  textContainer: {
    width: scaledSize(250), 
    marginLeft: scaledSize(10),
  },
  milestoneText: {
    color: 'white',
    fontSize: scaledSize(14),
    fontFamily: 'ComicSerifPro',
  },
});

