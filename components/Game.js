import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, TouchableOpacity, Modal, SafeAreaView} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Line } from 'react-native-svg';
import * as words_a from './words/words_a';
import * as words_b from './words/words_b';
import * as words_c from './words/words_c';
import * as words_d from './words/words_d';
import * as words_e from './words/words_e';
import * as words_f from './words/words_f';
import * as words_g from './words/words_g';
import * as words_h from './words/words_h';
import * as words_i from './words/words_i';
import * as words_j from './words/words_j';
import * as words_k from './words/words_k';
import * as words_l from './words/words_l';
import * as words_m from './words/words_m';
import * as words_n from './words/words_n';
import * as words_o from './words/words_o';
import * as words_p from './words/words_p';
import * as words_q from './words/words_q';
import * as words_r from './words/words_r';
import * as words_s from './words/words_s';
import * as words_t from './words/words_t';
import * as words_u from './words/words_u';
import * as words_v from './words/words_v';
import * as words_w from './words/words_w';
import * as words_x from './words/words_x';
import * as words_y from './words/words_y';
import * as words_z from './words/words_z';
import Trie from './Trie';
import Rules from './Rules';
import axios from 'axios';
import { playButtonSound, playCellSound,playBGM,stopBGM,pauseBgm,playCorrectSound, pauseBGM, unpauseBGM} from '../AudioHelper';
import SoundContext from '../SoundContext';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType } from 'react-native-google-mobile-ads';


import {
 
  updateTotalScoreForTime,  // Newly added

  updateAllWordsUserFound,

  updateHighScoreIfNeeded,

  incrementGamesPlayed,  // Newly added
  ALL_WORDS_USER_FOUND_KEY
} from '../StorageHelper';
import { Axios } from 'axios';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MARGIN_BETWEEN_CELLS = 7;
const cellSize = (0.75 * windowHeight) / 10;


const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true
});

export default function Game({ route, navigation}) {
  
  const [lines, setLines] = useState([]);
  const [visited, setVisited] = useState(new Set());
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [submitString, setSubmitString] = useState('');
  const { selectedMapIndex, selectedTime } = route.params;
  const [time, setTime] = useState(parseInt(selectedTime.split(' ')[0]) * 60);
  const [letters, setLetters] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [currentString, setCurrentString] = useState('');
  const [allWords, setAllWords] = useState(new Set());
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalVisible,setModalVisible] = useState(false);
  const { isSoundMuted, isMusicMuted, setIsSoundMuted, setIsMusicMuted } = useContext(SoundContext);
  const wordsUserFound = useRef(new Set());
  const hasRun = useRef(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  
  const loadInterstitial = () => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setInterstitialLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setInterstitialLoaded(false);
        interstitial.load();
      }
    );

    interstitial.load();

    return () => {
      unsubscribeClosed();
      unsubscribeLoaded();
    }
  }


  useEffect(() => {
    playBGM(isMusicMuted);
    return () => {
        stopBGM(isMusicMuted);
    };
}, []);
useEffect(() => {
  const unsubscribeInterstitialEvents = loadInterstitial();


  return () => {
    unsubscribeInterstitialEvents();
  };
}, [])


  useEffect(()=> {
    if (isValidWord(submitString) && !wordsUserFound.current.has(submitString)) {
      let currentScore = score;
      currentScore +=  calcScore(submitString);
      setScore(currentScore);
      wordsUserFound.current.add(submitString);
      playCorrectSound(isSoundMuted);
    } 

  }, [submitString])

  const calcScore = (word) => {
    if  (!word || word.length == 0) {
      return 0;
    }
    return word.length ** 2;
  }


  const isValidWord = (word) => {
    if (!allWords || allWords.size === 0 || !word || word.length === 0) return false;
    return allWords.has(word.toLowerCase());
  }


  const wordsMap = {
    a: words_a.words_a,
    b: words_b.words_b,
    c: words_c.words_c,
    d: words_d.words_d,
    e: words_e.words_e,
    f: words_f.words_f,
    g: words_g.words_g,
    h: words_h.words_h,
    i: words_i.words_i,
    j: words_j.words_j,
    k: words_k.words_k,
    l: words_l.words_l,
    m: words_m.words_m,
    n: words_n.words_n,
    o: words_o.words_o,
    p: words_p.words_p,
    q: words_q.words_q,
    r: words_r.words_r,
    s: words_s.words_s,
    t: words_t.words_t,
    u: words_u.words_u,
    v: words_v.words_v,
    w: words_w.words_w,
    x: words_x.words_x,
    y: words_y.words_y,
    z: words_z.words_z,
};

function findWords(board, trieInstance) {
  const rows = board.length;
  const cols = board[0].length;
  let result = new Set();

  function backtrack(row, col, currentPrefix, visited) {
      if (row < 0 || col < 0 || row >= rows || col >= cols || visited[row][col] || board[row][col] == '') return;

      currentPrefix += board[row][col];

      //invalid prefix
      if (!trieInstance.startsWith(currentPrefix.toLowerCase())) return;

      //valid word
      if (trieInstance.search(currentPrefix.toLowerCase())) {
          result.add(currentPrefix.toLowerCase());
      }

      visited[row][col] = true;

      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (let [dx, dy] of directions) {
          backtrack(row + dx, col + dy, currentPrefix, visited);
      }

      visited[row][col] = false;
  }

  for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
          let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
          backtrack(i, j, '', visited);
      }
  }

  return Array.from(result);
}

useEffect(() => {

  if (!hasRun.current && letters && Array.isArray(letters) && letters.length > 0 && Array.isArray(letters[0])) {

      var trie = new Trie();
      for (const letter in wordsMap) {
          if (wordsMap.hasOwnProperty(letter)) {
              for (const word of wordsMap[letter]) {
                  trie.insert(word.toLowerCase());
              }
          }
      }

      const foundWords = findWords(letters, trie);

      setAllWords(new Set(foundWords));
      trie = null;
      hasRun.current = true;

  }
}, [letters]);



const onLayout = (event) => {
  const { x, y } = event.nativeEvent.layout;
  setViewPosition({ x, y });
};


useEffect(()=> {
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
  


  
  
  function getRandomLetter() {
    const frequencyDist = [
      'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'T', 'T', 'T', 'T', 'T', 'T', 'A', 'A', 'A', 'A', 'A', 'A', 'O', 'O', 'O', 'O', 'O', 'O', 'I', 'I', 'I', 'I', 'I', 'I', 'N', 'N', 'N', 'N', 'N', 'N', 'S', 'S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H', 'H', 'R', 'R', 'R', 'R', 'D', 'D', 'D', 'D', 'L', 'L', 'L', 'L', 'U', 'U', 'U', 'U', 'C', 'C', 'C', 'M', 'M', 'M', 'W', 'W', 'F', 'F', 'G', 'G', 'Y', 'Y', 'P', 'P', 'B', 'V', 'K', 'J', 'X', 'Q', 'Z'
    ];
    return frequencyDist[Math.floor(Math.random() * frequencyDist.length)];
  }
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
  
  



  const generateLetters = (rows, cols) => {
    let generatedLetters = [];

    for (let i = 0; i < rows; i++) {
      let row = [];

      for (let j = 0; j < cols; j++) {
        let letter = getRandomLetter();
        switch (selectedMapIndex) {
          case 2:
            if ((i === 0 || i === 4) && (j === 0 || j === 4)) {
              letter = '';
            }
            break;
          case 3:
            if ((i + j) % 2 !== 0) {
              letter = '';
            }
            break;
          default:
            break;
        }

        row.push(letter);
      }

      generatedLetters.push(row);
    }

    return generatedLetters;
  };

  useEffect(() => {
    switch (selectedMapIndex) {
      case 0:
        setLetters(generateLetters(4, 4));
        break;
      case 1:
      case 2:
      case 3:
        setLetters(generateLetters(5, 5));
        break;
      default:
        break;
    }
  }, [selectedMapIndex]);
  useEffect(() => {
    if (isPaused) return;

    const timerId = setTimeout(async () => {
        if (time > 0) {
            setTime(-1);
        } else {
            // Load and possibly show the ad
            const shouldAdShow = shouldShowInterstitial(selectedTime);
            
            if (shouldAdShow && interstitialLoaded) {
                stopBGM();
                interstitial.show();
                navigateToPostGame(); 
            } else {
            navigateToPostGame(); 
            }
               
        }
    }, 1000);

    return () => clearTimeout(timerId);
}, [time, isPaused, navigation, allWords, wordsUserFound, score, selectedTime]);

const shouldShowInterstitial = (selectedTime) => {
  const random = Math.random();
  switch (selectedTime) {
    case '1 min':
      return random <= 0.33;
    case '3 min':
      return random <= 0.50;
    case '5 min':
      return random <= 0.75;
    default:
      return false;
  }
}

const navigateToPostGame = async () => {
  // Update AsyncStorage
  await updateTotalScoreForTime(selectedTime, score);
  await updateAllWordsUserFound(Array.from(wordsUserFound.current));
  await updateHighScoreIfNeeded(selectedTime, score);
  await incrementGamesPlayed(selectedTime);

  // Navigate to PostGame
  navigation.reset({
    index: 0,
    routes: [{
      name: 'PostGame',
      params: {
        allWords: allWords,
        foundWords: Array.from(wordsUserFound.current),
        userScore: score
      }
    }],
  });

  stopBGM(isMusicMuted);
}


  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    

      onPanResponderMove: (evt) => {
      const touchX = evt.nativeEvent.pageX;
      const touchY = evt.nativeEvent.pageY;
  
      const relativeTouchX = touchX - viewPosition?.x;
      const relativeTouchY = touchY - viewPosition?.y;
  
      
      const cell = getCellFromCoordinates(relativeTouchX, relativeTouchY);
  
      setLines(prevLines => {
          if(prevLines.length > 0) {
              const lastPoint = prevLines[prevLines.length - 1].end;
              if(lastPoint.x !== relativeTouchX || lastPoint.y !== relativeTouchY) {
                  return [...prevLines, { start: lastPoint, end: { x: relativeTouchX, y: relativeTouchY } }];
              }
              return prevLines;
          } else {
              return [{ start: { x: relativeTouchX, y: relativeTouchY }, end: { x: relativeTouchX, y: relativeTouchY } }];
          }
      });
  
      if (cell && !highlightedCells.some(hCell => hCell.row === cell.row && hCell.col === cell.col)) {
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


  const renderCell = (isFilled, letter = '', rowIndex, colIndex) => {
    let cellBorderStyle = {
      borderWidth: 0.5,
    };

    let isHighlighted = highlightedCells.some(cell => cell.row === rowIndex && cell.col === colIndex 
      && rowIndex < letters.length && rowIndex >= 0 && colIndex >= 0 && colIndex < letters.length && letters[rowIndex][colIndex] !== '');

    return (
      <View
        {...panResponder.panHandlers}
        style={[
          styles.cell,
          cellBorderStyle,
          isFilled ? styles.filledCell : styles.emptyCell,
          isHighlighted ? styles.highlightedCell : null
        ]}
        key={colIndex}
      >
        <Text style={styles.cellText}>{isFilled ? letter : ''}</Text>
      </View>
    );
  };

  const renderMap = () => {
    return (
        <View style={{ ...styles.mapContainer, ...{ zIndex: 1 } }}>
            <Svg style={{ ...styles.mapContainer, ...{ position: 'absolute', zIndex: 2 } }}>
                {lines.map((line, index) => (
                    <Line
                        key={index}
                        x1={line.start.x}
                        y1={line.start.y}
                        x2={line.end.x}
                        y2={line.end.y}
                        stroke="white"
                        strokeWidth="2"
                    />
                ))}
            </Svg>
            {letters.map((row, rowIndex) => (
                <View style={styles.row} key={rowIndex}>
                    {row.map((letter, colIndex) => {
                        let isFilled = true;

                        switch (selectedMapIndex) {
                            case 2:
                                if ((rowIndex === 0 || rowIndex === 4) && (colIndex === 0 || colIndex === 4)) {
                                    isFilled = false;
                                }
                                break;
                            case 3:
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'ComicSerifPro',
    marginBottom: 20,
  },
  mapContainer: {

    
  },
  draggedString: {
    color: isValidWord(currentString) && wordsUserFound.current.has(currentString) ? '#EED292' : isValidWord(currentString) ? 'rgb(0, 175, 155)' : 'white',
    fontSize: 24,
    fontFamily: 'ComicSerifPro',
    marginBottom: 10,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    margin: MARGIN_BETWEEN_CELLS,
    borderRadius: 5
  },
  filledCell: {
    backgroundColor: 'transparent',
  },
  emptyCell: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  cellText: {
    color: '#2E3192',
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'ComicSerifPro',
  },
  highlightedCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    fontSize: (24),
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20
  },
  closeButton: {
    marginTop: 20,
    padding: (12),
    borderRadius: (15),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  closeButtonText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: (20),
  },

  pauseButton: {
    position: 'absolute',
    top: 30,     
    right: 30,   
  },
  safeAreaContainer: {
    flex: 1,
    width: '100%',
    justifyContent:'center',
    alignItems:'center'
  },
});


 
return (
  <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.container}>
    <SafeAreaView style={styles.safeAreaContainer}>
      <Text style={styles.text}>Time: {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</Text>
      <Text style = {styles.text}>Score: {score}</Text>
      <View style={styles.scoreContainer}>
          <Text style={styles.draggedString}>{currentString || ''} </Text>
          <Text style={styles.draggedString}>{isValidWord(currentString) && !wordsUserFound.current.has(currentString)? "+"+calcScore(currentString) : ''} </Text>
      </View>
      <View style={styles.mapContainer} onLayout={onLayout} {...panResponder.panHandlers}>
          {renderMap()}
      </View>

      {/* Pause button positioned in the top right corner */}
      <TouchableOpacity style={[styles.closeButton, styles.pauseButton]} onPress={() => {setIsPaused(true); playButtonSound(isSoundMuted); pauseBGM(isMusicMuted)}}>
          <Text style={styles.closeButtonText}>Pause</Text>
      </TouchableOpacity>
      <View style ={{marginTop:90}}>
      <BannerAd
        unitId={TestIds.BANNER}
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
        <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.modalContainer}>
            <Text style={styles.modalText}>Game Paused!</Text>
            {/* Add any other necessary components or text */}
            <TouchableOpacity onPress={() => {setIsPaused(false);playButtonSound(isSoundMuted);unpauseBGM(isMusicMuted)}} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setModalVisible(true);playButtonSound(isSoundMuted)}} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Rules</Text>
            </TouchableOpacity>

          <View >
        <TouchableOpacity style={styles.closeButton} onPress={() => {
            setIsSoundMuted(!isSoundMuted);
            playButtonSound(isSoundMuted); // play sound if you want feedback on mute toggle
        }}>
           
                <FontAwesome name={isSoundMuted ? 'volume-off' : 'volume-up'} size={50} color="#fff" />
  
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={() => {
            setIsMusicMuted(!isMusicMuted);
            playButtonSound(isSoundMuted); // play sound if you want feedback on mute toggle
        }}>
           
                <FontAwesome name={isMusicMuted ? 'music' : 'music'} size={50} color={isMusicMuted ? 'gray' : '#fff'} />

        </TouchableOpacity>
    </View>
        </LinearGradient>
        <Rules modalVisible = {modalVisible} setModalVisible = {setModalVisible}/>
    </Modal>
   
  </LinearGradient>
);


}


