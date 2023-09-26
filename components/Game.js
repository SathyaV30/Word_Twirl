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
  updateTotalScoreForTime, 
  updateAllWordsUserFound,
  updateHighScoreIfNeeded,
  incrementGamesPlayed,  
  ALL_WORDS_USER_FOUND_KEY,
  unlockMap,
  getUnlockedMaps,
  getTotalScoreForTime,
  getGamesPlayed,
  getAllWordsUserFound
} from '../StorageHelper';
import { Axios } from 'axios';
import GradientContext from '../GradientContext';
import { MAP_OPTIONS } from './StylesScreen';
import { scaledSize } from '../ScalingUtility';
import { adUnitIdBanner, adUnitIdInterstitial } from '../AdHelper';
const windowHeight = Dimensions.get('window').height;

const interstitial = InterstitialAd.createForAdRequest(adUnitIdInterstitial, {
  requestNonPersonalizedAdsOnly: true
});
//Handle game functionality
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

  const {gradientColors} = useContext(GradientContext)
  const [wordsToPath, setWordsToPath] = useState({});

const MARGIN_BETWEEN_CELLS = scaledSize(7);
const cellSizeTemp = letters.length == 4 || letters.length == 5 ? (0.75 * windowHeight) / 10 : (0.6 * windowHeight) / 10 ;
var cellSize;
if (scaledSize(cellSizeTemp) >= 50) {
  cellSize = scaledSize(cellSizeTemp);
} else  {
 cellSize = 50;
}

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
        navigateToPostGame();

      }
    );

    interstitial.load();

    return () => {
      unsubscribeClosed();
      unsubscribeLoaded();
    }
}

  
  useEffect(() => {
    const unsubscribeInterstitialEvents = loadInterstitial();
 
    
    return () => {
      unsubscribeInterstitialEvents();

    };
  }, [])
  
    useEffect(() => {
      playBGM(isMusicMuted);
      return () => {
          stopBGM(isMusicMuted);
      };
  }, []);
  
  //check word after submit
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


//Backtracking function with trie to find all possible words from the board
function findWords(board, trieInstance) {
  const rows = board.length;
  const cols = board[0].length;
  let result = new Set();

  function backtrack(row, col, currentPrefix, visited, path) {
      if (row < 0 || col < 0 || row >= rows || col >= cols || visited[row][col] || board[row][col] == '') return;

      currentPrefix += board[row][col];
      path.push([row, col]);

      //invalid prefix
      if (!trieInstance.startsWith(currentPrefix.toLowerCase())) {
          path.pop(); 
          return;
      }

      //valid word
      if (trieInstance.search(currentPrefix.toLowerCase())) {
          result.add({ word: currentPrefix.toLowerCase(), path: [...path] });
      }

      visited[row][col] = true;

      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (let [dx, dy] of directions) {
          backtrack(row + dx, col + dy, currentPrefix, visited, path);
      }

      visited[row][col] = false;
      path.pop();  // backtrack on the path as well
  }

  for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
          let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
          backtrack(i, j, '', visited, []);
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

    const wordsToPathTemp = findWords(letters, trie);
    const wordOnly = wordsToPathTemp.map(entry => entry.word);

    setWordsToPath(wordsToPathTemp);
    setAllWords(new Set(wordOnly));
    
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
  
  //Generate letters based on boggle dice. Source: https://boardgamegeek.com/thread/300883/letter-distribution
  function getRandomLetter(size) {
    let frequencyDist;
  

    if (size === 4) { // 4x4 Boggle
      frequencyDist = 
        'E'.repeat(12) + 
        'T'.repeat(6) + 
        'A'.repeat(6) + 'O'.repeat(6) + 'I'.repeat(6) + 
        'N'.repeat(6) + 'S'.repeat(6) + 'H'.repeat(6) + 'R'.repeat(6) + 
        'D'.repeat(4) + 
        'L'.repeat(4) + 'U'.repeat(4) + 
        'C'.repeat(3) + 
        'M'.repeat(3) + 
        'W'.repeat(2) + 
        'F'.repeat(2) + 'G'.repeat(2) + 
        'Y'.repeat(2) + 
        'P'.repeat(2) + 
        'B' + 'V' + 'K' + 'J' + 'X' + 'Q' + 'Z';
    } else if (size === 5) { // 5x5 Big Boggle
      frequencyDist = 
        'A'.repeat(9) + 
        'E'.repeat(9) + 
        'I'.repeat(6) + 
        'O'.repeat(6) + 'N'.repeat(6) + 
        'T'.repeat(5) + 
        'R'.repeat(4) + 
        'S'.repeat(4) + 
        'L'.repeat(4) + 'U'.repeat(4) + 
        'D'.repeat(3) + 
        'G'.repeat(2) + 
        'P'.repeat(2) + 'M'.repeat(2) + 
        'H'.repeat(2) + 'C'.repeat(2) + 
        'B' + 'Y' + 'F' + 'W' + 'K' + 'V' + 'X' + 'J' + 'Q' + 'Z';
    } else if (size === 6) { // 6x6 Super Big Boggle
      frequencyDist = 
        'E'.repeat(19) + 
        'T'.repeat(13) + 
        'A'.repeat(12) + 'R'.repeat(12) + 
        'I'.repeat(11) + 'N'.repeat(11) + 'O'.repeat(11) + 
        'S'.repeat(9) + 
        'D'.repeat(6) + 
        'C'.repeat(5) + 'H'.repeat(5) + 'L'.repeat(5) + 
        'F'.repeat(4) + 'M'.repeat(4) + 'P'.repeat(4) + 'U'.repeat(4) + 
        'G'.repeat(3) + 'Y'.repeat(3) + 
        'W'.repeat(2) + 
        'B' + 'J' + 'K' + 'Q' + 'V' + 'X' + 'Z';
    } else {
      throw new Error('Unsupported grid size');
    }
  
    return frequencyDist[Math.floor(Math.random() * frequencyDist.length)];
  }

  // function getRandomLetter() {
  //   const frequencyDist = [
  //     'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'T', 'T', 'T', 'T', 'T', 'T', 'A', 'A', 'A', 'A', 'A', 'A', 'O', 'O', 'O', 'O', 'O', 'O', 'I', 'I', 'I', 'I', 'I', 'I', 'N', 'N', 'N', 'N', 'N', 'N', 'S', 'S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H', 'H', 'R', 'R', 'R', 'R', 'D', 'D', 'D', 'D', 'L', 'L', 'L', 'L', 'U', 'U', 'U', 'U', 'C', 'C', 'C', 'M', 'M', 'M', 'W', 'W', 'F', 'F', 'G', 'G', 'Y', 'Y', 'P', 'P', 'B', 'V', 'K', 'J', 'X', 'Q', 'Z'
  //   ];

  //   return frequencyDist[Math.floor(Math.random() * frequencyDist.length)];
  // }
  

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
  
  //generate letters for specified board
  const generateLetters = (rows, cols) => {
    let generatedLetters = [];

    for (let i = 0; i < rows; i++) {
      let row = [];

      for (let j = 0; j < cols; j++) {
        let letter = getRandomLetter(rows);
        switch (selectedMapIndex) {
          case 2:
            if ((i === 0 || i === 4) && (j === 0 || j === 4) || (i === 2 && j === 2)) {
              letter = '';
            }
            break;
          case 3:
            if ((i + j) % 2 !== 0) {
              letter = '';
            }
            break;
          case 5: 
          if ((i === 0 || i === 5) && (j === 0 || j === 5) || 
          (i === 2 && (j === 2 || j === 3)) || 
          (i === 3 && (j === 2 || j === 3))) {
          letter = '';
      }
      
          break;
          case 6:
            if ((i + j) % 2 !== 0) {
              letter = '';
            }

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
        case 4:
        case 5:
        case 6:
      setLetters(generateLetters(6,6));
      default:
        break;
    }
  }, [selectedMapIndex]);

  useEffect(() => {
    if (isPaused) return;

    const timerId = setTimeout(async () => {
        if (time > 0) {
            setTime(time-1);
        } else {
           
            
          
              if (interstitialLoaded) {
                  stopBGM();
                  interstitial.show();
              } 
            
            navigateToPostGame();
               
        }
    }, 1000);

    return () => clearTimeout(timerId);
}, [time, isPaused, navigation, allWords, wordsUserFound, score, selectedTime]);


//TBD if to use
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
  await checkAndUnlockMaps();
  // Navigate to PostGame
  navigation.reset({
    index: 0,
    routes: [{
      name: 'PostGame',
      params: {
        allWords: Array.from(allWords),
        foundWords: Array.from(wordsUserFound.current),
        userScore: score,
        selectedTime: selectedTime,
        wordsToPath:wordsToPath,
        letters:letters,
      }
    }],
  });

  stopBGM(isMusicMuted);
}

const checkAndUnlockMaps = async () => {
  const totalScore = await getTotalScoreForTime(selectedTime);
  const gamesPlayed = await getGamesPlayed(selectedTime);
  const allWordsUserFound = await getAllWordsUserFound();
  const longestWordFound = Math.max(...Array.from(allWordsUserFound).map(word => word.length), 0); 

  const unlockedMaps = await getUnlockedMaps();
  for (const mapOption of MAP_OPTIONS) {
    if (!unlockedMaps.includes(mapOption.idx)) {
      if ((mapOption.requiredScore && totalScore >= mapOption.requiredScore) ||
          (mapOption.requiredGamesPlayed && gamesPlayed >= mapOption.requiredGamesPlayed) ||
          (mapOption.requiredWordLength && longestWordFound >= mapOption.requiredWordLength)) {
        await unlockMap(mapOption.idx);
      }
    }
  }
};

const isCellFilled = (rowIndex, colIndex) => {
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
           <Svg style={{ ...styles.mapContainer, position: 'absolute', zIndex: 0 }}>
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
    fontSize: scaledSize(24),
    fontFamily: 'ComicSerifPro',
    marginBottom: scaledSize(10),
    alignSelf: 'center',
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
    borderRadius: scaledSize(5)
  },
  filledCell: {
    backgroundColor: 'transparent',
  },
  emptyCell: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  cellText: {
    color: 'white',
    fontSize: scaledSize(36),
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
    fontSize: scaledSize(24),
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
  },
  closeButtonText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: scaledSize(20),
  },
  pauseButton: {
    position: 'absolute',
    top: scaledSize(30),     
    right: scaledSize(30),   
  },
  safeAreaContainer: {
    flex: 1,
    width: '100%',
    justifyContent:'center',
    alignItems:'center'
  },
});



 
return (
  <LinearGradient colors={gradientColors} style={styles.container}>
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
     
      <TouchableOpacity style={[styles.closeButton, styles.pauseButton]} onPress={() => {setIsPaused(true); playButtonSound(isSoundMuted); pauseBGM(isMusicMuted)}}>
          <Text style={styles.closeButtonText}>Pause</Text>
      </TouchableOpacity>

      <View style ={{height:50, marginTop:scaledSize(90)}}>
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
            <TouchableOpacity onPress={() => {setIsPaused(false);playButtonSound(isSoundMuted);unpauseBGM(isMusicMuted)}} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setModalVisible(true);playButtonSound(isSoundMuted)}} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Rules</Text>
            </TouchableOpacity>

          <View >
        <TouchableOpacity style={styles.closeButton} onPress={() => {
            setIsSoundMuted(!isSoundMuted);
            playButtonSound(isSoundMuted); 
        }}>
           
                <FontAwesome name={isSoundMuted ? 'volume-off' : 'volume-up'} size={50} color={isSoundMuted ? 'gray' : '#fff'} />
  
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={() => {
            setIsMusicMuted(!isMusicMuted);
            playButtonSound(isSoundMuted); 
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


