import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, TouchableOpacity, Modal, SafeAreaView, ScrollView} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Line } from 'react-native-svg';
import Trie from './Trie';
import Rules from './Rules';
import axios from 'axios';
import { playButtonSound, playCellSound,playBGM,stopBGM,pauseBgm,playCorrectSound, pauseBGM, unpauseBGM} from '../AudioHelper';
import SoundContext from '../SoundContext';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { Axios } from 'axios';
import GradientContext from '../GradientContext';
import { MAP_OPTIONS } from './StylesScreen';
import { scaledSize } from '../ScalingUtility';
import { adUnitIdBanner, adUnitIdInterstitial } from '../AdHelper';
import ScoreCounter from './ScoreCounter'; 
import { ConfirmDialog } from 'react-native-simple-dialogs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lvl1State } from './levels/level1.js';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType} from 'react-native-google-mobile-ads';
import * as Haptics from 'expo-haptics';
import HapticContext from '../HapticContext';
const windowHeight = Dimensions.get('window').height;


//Handle Level mode functionality TODO
export default function Level({ route, navigation}) {
  const [lines, setLines] = useState([]);
  const [visited, setVisited] = useState(new Set());
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [submitString, setSubmitString] = useState('');
  const [letters, setLetters] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [currentString, setCurrentString] = useState('');
  const [allWords, setAllWords] = useState(new Set());
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalVisible,setModalVisible] = useState(false);
  const { isSoundMuted, setIsSoundMuted } = useContext(SoundContext);
  const wordsUserFound = useRef(new Set());
  const hasRun = useRef(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const {gradientColors} = useContext(GradientContext)
  const [wordsToPath, setWordsToPath] = useState({});
  const [endGameModal, setEndGameModal] = useState(false);
  const [selectedMapIndex, setSelectedMapIndex] = useState(null);
  const {isHapticEnabled, setIsHapticEnabled} = useContext(HapticContext);
  const initialRender = useRef(true);

const MARGIN_BETWEEN_CELLS = scaledSize(7);
const cellSizeTemp = letters.length == 4 || letters.length == 5 ? (0.75 * windowHeight) / 10 : (0.6 * windowHeight) / 10 ;

var cellSize;
if (scaledSize(cellSizeTemp) >= 50) {
  cellSize = scaledSize(cellSizeTemp);
} else  {
 cellSize = 50;
}
  
  const { level } = route.params;



  const isValidWord = (word) => {
    if (!allWords || allWords.size === 0 || !word || word.length === 0) return false;
    return allWords.has(word.toLowerCase());
  }

  useEffect(() => {
   
    
    // This function will determine the selectedMapIndex based on the level
    const determineMapIndex = (level) => {
      if (level >= 1 && level <= 6) {
        return 0;
      } else if (level >= 7 && level <= 12) {
        return 1;
      } else if (level >= 13 && level <= 18) {
        return 2;
      } else if (level >= 19 && level <= 24) {
        return 5;
      } else if (level >= 25 && level <= 30) {
        return 4;
      } else {
        return null;
      }
    };

    setLetters(lvl1State.letters);
    setAllWords(new Set(lvl1State.allWords));
    setSelectedMapIndex(determineMapIndex(level));
  
  }, []);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: 'white',
      fontSize: scaledSize(24),
      fontFamily: 'ComicSerifPro',
      marginBottom: scaledSize(20),
    },
    mapContainer: {},
    draggedString: {
      color: isValidWord(currentString) && wordsUserFound.current.has(currentString) ? '#EED292' : isValidWord(currentString) ? 'rgb(0, 175, 155)' : 'white',
      fontSize: scaledSize(40),
      fontFamily: 'ComicSerifPro',
      alignSelf: 'center',
      marginTop:scaledSize(20),
      marginBottom:scaledSize(20),
    },
    row: {
      flexDirection: 'row',
    },
    cell: {
      width: (cellSize),
      height: (cellSize),
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      margin: (MARGIN_BETWEEN_CELLS),
      borderRadius: scaledSize(5),
      fontFamily: 'ComicSerifPro',
    },
    filledCell: {
      backgroundColor: 'transparent',
      fontFamily: 'ComicSerifPro',
      borderRadius: scaledSize(5),
    },
    emptyCell: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      fontFamily: 'ComicSerifPro',
      borderRadius: scaledSize(5),
      visibility:'hidden'
  
    },
    cellText: {
      color: 'white',
      fontSize: cellSize/2,
      fontFamily: 'ComicSerifPro',
    },
    highlightedCell: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: scaledSize(5),
    },
    scoreContainer: {
      display:'flex',
      flexDirection:'row',
      justifyContent:'center'
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalText: {
      fontFamily: 'ComicSerifPro',
      fontSize: scaledSize(50),
      color: '#fff',
      textAlign: 'center',
      marginBottom: scaledSize(20)
    },
    closeButton: {
      marginTop: scaledSize(20),
      padding: scaledSize(12),
      borderRadius: scaledSize(15),
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: scaledSize(1),
      width:scaledSize(200)
    },
    closeButtonText: {
      fontFamily: 'ComicSerifPro',
      color: '#fff',
      fontSize: scaledSize(32),
      textAlign:'center',
      alignSelf:'center'
    },
    pauseButton: {
      borderRadius: scaledSize(15),
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: scaledSize(1),
      width:(letters?.length * (cellSize + 2 * MARGIN_BETWEEN_CELLS) - 2 * MARGIN_BETWEEN_CELLS)/2 - scaledSize(5),
      marginBottom:scaledSize(5),
      marginTop:scaledSize(5),
      padding:scaledSize(10)
    },
    safeAreaContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column', 
      justifyContent: 'center',
      alignItems: 'center'
    },
    optionsContainer: {
      flexDirection: 'row',
      width: letters?.length * (cellSize + 2 * MARGIN_BETWEEN_CELLS) - 2 * MARGIN_BETWEEN_CELLS,
      justifyContent:'space-between',
      alignItems:'start',
      alignSelf: 'center',
    
  },
  timeScoreContainer : {
    flexDirection:'column',
    justifyContent:'space-between',
    width: (letters?.length * (cellSize + 2 * MARGIN_BETWEEN_CELLS) - 2 * MARGIN_BETWEEN_CELLS)/2 * 1.6
    
  },
  wordListContainerText: {
    color: 'white',
    fontSize: scaledSize(22),
    fontFamily: 'ComicSerifPro',
    marginVertical:scaledSize(2.5),
    textAlign:'center',

  },
  
  scoreText: { 
  color: 'white',
  fontSize: scaledSize(50),
  fontFamily: 'ComicSerifPro',
  
  },
  clockContainer: {
    flexDirection:'row',
    alignItems:'center',
    marginBottom:scaledSize(10)
  },
  optionsButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    display:'flex',
  
  
  },
  soundButton: {
    borderRadius: scaledSize(15),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: scaledSize(1),
    width: scaledSize(60),
    height:scaledSize(60),
    marginVertical: scaledSize(2.5),
    justifyContent:'center',
  
  },

  wordListButton: {
    borderRadius: scaledSize(15),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: scaledSize(1),
    width: '100%',
    height:scaledSize(60),
    marginVertical: scaledSize(2.5),
    justifyContent:'center',

  },


  wordsFoundText: {
    borderRadius: scaledSize(15),
    width: '100%',
    height:scaledSize(60),
    marginVertical: scaledSize(2.5),
    justifyContent:'center',


  }


  
    
  
  });
  

  const onLayout = (event) => {
    const { x, y } = event.nativeEvent.layout;
    setViewPosition({ x, y });
  };
  
  
  useEffect(()=> {
    if (initialRender.current) {
      initialRender.current = false;
    } else if (isHapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    setCurrentString(highlightedCells
      .map(cell => {
        if (letters && letters[cell.row] && typeof letters[cell.row][cell.col] !== 'undefined') {
          return letters[cell.row][cell.col];
        }
        return null;  
      })
      .filter(Boolean)  
      
      .join(''));
      if (getDraggedString()) {
      playCellSound(highlightedCells.length-1,isSoundMuted);
      }
  }, [highlightedCells]);
  
  
  const getCellFromCoordinates = (x, y) => {
    for (let row = 0; row < letters.length; row++) {
      for (let col = 0; col < (letters[0] || []).length; col++) {
        const cellLeft = col * (cellSize + 2*MARGIN_BETWEEN_CELLS);
        const cellRight = cellLeft + cellSize;
        const cellTop = row * (cellSize + 2*MARGIN_BETWEEN_CELLS);
        const cellBottom = cellTop + cellSize;

        if (x >= cellLeft && x <= cellRight && y >= cellTop && y <= cellBottom) {
          return { row, col };
        }
      }
    }
    return null;
  };
  
  useEffect(()=> {
    console.log(getDraggedString())
  }, [highlightedCells])
  
    const getDraggedString = () => {
  
      return highlightedCells
        .map(cell => {
          if (letters && letters[cell.row] && typeof letters[cell.row][cell.col] !== 'undefined') {
            return letters[cell.row][cell.col];
          }
          return null;  
        })
        .filter(Boolean)  
        
        .join('');
    };
    

  const isCellFilled = (rowIndex, colIndex) => {
    let selectedMapIndex = level
    switch (selectedMapIndex) {
        case 2:
            return !((rowIndex === 0 || rowIndex === 4) && (colIndex === 0 || colIndex === 4) || (rowIndex == 2 && colIndex == 2));
        case 3:
            return (rowIndex + colIndex) % 2 === 0;
        case 5:
            return !((rowIndex === 0 || rowIndex === 5) && (colIndex === 0 || colIndex === 5) || 
                    (rowIndex === 2 && (colIndex === 2 || colIndex === 3)) || 
                    (rowIndex === 3 && (colIndex === 2 || colIndex === 3)));
        case 6:
            return (rowIndex + colIndex) % 2 === 0;
        default:
            return true; 
    }
}

  //touch responder for selecting cells
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    

    onPanResponderMove: (evt) => {
      const touchX = evt.nativeEvent.pageX;
      const touchY = evt.nativeEvent.pageY;
  
      const relativeTouchX = touchX - viewPosition?.x;
      const relativeTouchY = touchY - viewPosition?.y;
  
      const cell = getCellFromCoordinates(relativeTouchX, relativeTouchY);
    
      if (cell && isCellFilled(cell.row, cell.col)  && !highlightedCells.some(hCell => hCell.row === cell.row && hCell.col === cell.col)) {
          setHighlightedCells(prev => {
              const lastHighlighted = prev[prev.length - 1];
              if (lastHighlighted &&
                  (Math.abs(lastHighlighted.row - cell.row) <= 1 && Math.abs(lastHighlighted.col - cell.col) <= 1) && !visited.has(""+cell.row +" " + cell.col)) {
                  visited.add(""+cell.row+ " " + cell.col);
                  return [...prev, { row: cell.row, col: cell.col }];
              }
              if (prev.length === 0 && !visited.has(""+cell.row +" " + cell.col)) {
                  visited.add(""+cell.row+ " " + cell.col);
                  return [{ row: cell.row, col: cell.col }];
              }
              return prev;
          });
      }
  },
  
    onPanResponderRelease: () => {
      setHighlightedCells([]);
      setLines([]);
      setVisited(new Set());
      setSubmitString(getDraggedString())
    }
});

useEffect(() => {
  if (highlightedCells.length > 1) {
      const lastCell = highlightedCells[highlightedCells.length - 1];
      const secondLastCell = highlightedCells[highlightedCells.length - 2];

    
      const getCenterPoint = (row, col) => ({
          x: MARGIN_BETWEEN_CELLS + (col) * (cellSize + MARGIN_BETWEEN_CELLS * 2) + cellSize/2,
          y: MARGIN_BETWEEN_CELLS + (row) * (cellSize + MARGIN_BETWEEN_CELLS * 2) + cellSize/2,
      });

      const line = {
          start: getCenterPoint(secondLastCell.row, secondLastCell.col),
          end: getCenterPoint(lastCell.row, lastCell.col)
      };
      
      setLines(prevLines => [...prevLines, line]);
  }
}, [highlightedCells]);


  const renderCell = (isFilled, letter = '', rowIndex, colIndex) => {

    let isHighlighted = highlightedCells.some(cell => cell.row === rowIndex && cell.col === colIndex 
      && rowIndex < letters.length && rowIndex >= 0 && colIndex >= 0 && colIndex < letters.length && letters[rowIndex][colIndex] !== '');

    return (
      <BlurView
        {...panResponder.panHandlers}
        style={[
          styles.cell,
          isFilled ? styles.filledCell : styles.emptyCell,
          isHighlighted ? styles.highlightedCell : null
        ]}
        key={colIndex}
      >
        <Text style={styles.cellText}>{isFilled ? letter : ''}</Text>
      </BlurView>
    );
  };

  const renderMap = () => {
    return (
        <View style={{ ...styles.mapContainer, ...{ zIndex: 1 } }}>
           <Svg style={{ ...styles.mapContainer, position: 'absolute', zIndex: 0 }}>
    {lines.map((line, index) => (
        <Line
            key={index}
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
            stroke="white"
            strokeWidth={`${cellSize/5}`}
        />
    ))}
</Svg>

            {letters.map((row, rowIndex) => (
                <View style={styles.row} key={rowIndex}>
                    {row.map((letter, colIndex) => {
                        let isFilled = true;

                        switch (selectedMapIndex) {
                            case 2:
                                if ((rowIndex === 0 || rowIndex === 4) && (colIndex === 0 || colIndex === 4) || (rowIndex == 2 && colIndex == 2)) {
                                    isFilled = false;
                                }
                                break;
                            case 3:
                                if ((rowIndex + colIndex) % 2 !== 0) {
                                    isFilled = false;
                                }
                                break;
                            case 5:
                              if ((rowIndex === 0 || rowIndex === 5) && (colIndex === 0 || colIndex === 5) || 
                                  (rowIndex === 2 && (colIndex === 2 || colIndex === 3)) || 
                                  (rowIndex === 3 && (colIndex === 2 || colIndex === 3))) {
                              isFilled = false;
                          }
                          
                                break;
                            case 6:
                                  if ((rowIndex + colIndex) % 2 !== 0) {
                                     isFilled = false;
                                  }
                                  break;
                              
                            default:
                                break;
                        }

                        return renderCell(isFilled, letter, rowIndex, colIndex);
                    })}
                </View>
            ))}
        </View>
    );


  
};

return (
  <LinearGradient colors={gradientColors} style={styles.container}>
    <SafeAreaView style={styles.safeAreaContainer}>
    <View style={styles.optionsContainer}>
      <View style = {styles.timeScoreContainer}>
        <TouchableOpacity style={styles.wordListButton}>
          <Text style = {styles.wordListContainerText}>View Word List</Text>
        </TouchableOpacity>
        <View style={styles.wordsFoundText}>
          <Text style = {styles.wordListContainerText}>192/200 Words Found</Text>
        </View>
       
      </View>
  
          
  <View style={styles.optionsButtonContainer}>

  <TouchableOpacity style={styles.soundButton} onPress={() => {setIsPaused(true); playButtonSound(isSoundMuted); }}>

  <FontAwesome name="pause" size = {scaledSize(40)} style = {{textAlign:'center', color:'white'}}/>


  </TouchableOpacity>
  <View style = {{flexDirection:'row'}}>

  <TouchableOpacity style={styles.soundButton} onPress={() => {
    setIsSoundMuted(!isSoundMuted);
    playButtonSound(isSoundMuted); 
  }}>
           
                <FontAwesome style ={{textAlign:'center'}} name={isSoundMuted ? 'volume-off' : 'volume-up'} size={scaledSize(40)} color={isSoundMuted ? 'gray' : '#fff'} />
  
        </TouchableOpacity>


</View>





          </View>

</View>

      

    
      <View style={styles.scoreContainer}>
      <Text style={styles.draggedString}>
  {currentString && currentString.length >= 15 ? `${currentString.substring(0, 11)}...` : currentString}
</Text>

          <Text style={styles.draggedString}>{isValidWord(currentString) && !wordsUserFound.current.has(currentString)? '' : ''} </Text>
      </View>
      
      <View style={styles.mapContainer} onLayout={onLayout} {...panResponder.panHandlers}>
          {renderMap()}
      </View>
     
    

      <View style ={{height:50, marginTop:scaledSize(50)}}>
      <BannerAd
        unitId={adUnitIdBanner}
        size={BannerAdSize.LARGE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true
        }}
    />
    </View>
    
    </SafeAreaView>

    {/* Pause Modal */}
    <Modal
        animationType="slide"
        transparent={true}
        visible={isPaused}
        onRequestClose={() => {
            setIsPaused(!isPaused);

        }}
    >
        <LinearGradient colors={gradientColors} style={styles.modalContainer}>
            <Text style={styles.modalText}>Game Paused!</Text>
            <TouchableOpacity onPress={() => {setIsPaused(false);playButtonSound(isSoundMuted);}} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity 
  onPress={() => {
    setModalVisible(true);
    playButtonSound(isSoundMuted);
  }}
  style={{ ...styles.closeButton, marginTop: scaledSize(20) }}
>

      <Text style={styles.closeButtonText}>Rules</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => {setEndGameModal(true)}}style={styles.closeButton}>
                <Text style={styles.closeButtonText}>End Game</Text>
            </TouchableOpacity>
            <ConfirmDialog
      title="Are you sure you want to save and return to home screen?"
      message="The stats for this puzzle will be saved."
      visible={endGameModal}
      onTouchOutside={() => setEndGameModal(false)}
      titleStyle={{ fontFamily: 'ComicSerifPro' }} 
      messageStyle={{ fontFamily: 'ComicSerifPro' }} 
      positiveButton={{
          title: "YES",
          onPress:() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }]
            });
            playButtonSound(isSoundMuted);
        },
        
          style: { fontFamily: 'ComicSerifPro', color:'black' },
      }}
      negativeButton={{
          title: "NO",
          onPress: () => {playButtonSound(isSoundMuted); setEndGameModal(false)},
          style: { fontFamily: 'ComicSerifPro', color:'black' },
      }}
    />



        </LinearGradient>
        <Rules modalVisible = {modalVisible} setModalVisible = {setModalVisible}/>
      
    </Modal>

  </LinearGradient>
);

  
}




