import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
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
import Trie from '../Screens/Trie';
import Rules from '../Screens/Rules';
import axios from 'axios';
import { playButtonSound, playCellSound, playCorrectSound } from '../../Helper/AudioHelper';
import SoundContext from '../../Context/SoundContext';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import {
  updateTotalScoreForTime, 
  updateAllWordsUserFound,
  updateHighScoreIfNeeded,
  incrementGamesPlayed,  
  ALL_WORDS_USER_FOUND_KEY,
  TOTAL_SCORE_KEY_PREFIX,
  unlockMap,
  getUnlockedMaps,
  getAllWordsUserFound,
  updateTotalAvgLenForTime,
  getStatForKey,
  GAMES_PLAYED_KEY_PREFIX,
  updateAccuracy
} from '../../Helper/StorageHelper';
import { findWords } from './GameFunctions';
import { getRandomLetter } from './GameFunctions';
import { Axios } from 'axios';
import GradientContext from '../../Context/GradientContext';
import { MAP_OPTIONS } from '../Screens/StylesScreen';
import { scaledSize } from '../../Helper/ScalingHelper';
import { adUnitIdBanner, adUnitIdInterstitial } from '../../Helper/AdHelper';
import ScoreCounter from '../Screens/ScoreCounter'; 
import { ConfirmDialog } from 'react-native-simple-dialogs';
import HapticContext from '../../Context/HapticContext';
import AuthContext from '../../Context/AuthContext';
import { calcScore } from './GameFunctions';
import { generateLetters } from './GameFunctions';
import io from 'socket.io-client';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import socket from '../../Helper/Socket';
const windowHeight = Dimensions.get('window').height;

const interstitial = InterstitialAd.createForAdRequest(adUnitIdInterstitial, {
  requestNonPersonalizedAdsOnly: true
});



//Handle game functionality
export default function Game({ route, navigation }) {
  const initialRender = useRef(true);
  const [lines, setLines] = useState([]);
  const [visited, setVisited] = useState(new Set());
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [submitString, setSubmitString] = useState('');
  const { selectedMapIndex, selectedTime, isGuest, isMultiplayer, room, opponentId, opponent} = route.params;
  const [time, setTime] = useState(parseInt(selectedTime.split(' ')[0]) * 60);
  const [letters, setLetters] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [currentString, setCurrentString] = useState('');
  const [allWords, setAllWords] = useState(new Set());
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { isSoundMuted, setIsSoundMuted } = useContext(SoundContext);
  const { userId } = useContext(AuthContext);
  const wordsUserFound = useRef(new Set());
  const hasRun = useRef(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const { gradientColors } = useContext(GradientContext);
  const [wordsToPath, setWordsToPath] = useState({});
  const [endGameModal, setEndGameModal] = useState(false);
  const { isHapticEnabled, setIsHapticEnabled } = useContext(HapticContext);
  const [attempts, setAttempts] = useState(0);
  const [posAttempts, setPosAttempts] = useState(0);
  const {username} = useContext(AuthContext);
  const hasGeneratedLetters = useRef(false);
  const hasRecievedLetters = useRef(false);

  const MARGIN_BETWEEN_CELLS = scaledSize(7);
  const cellSizeTemp = letters.length === 4 || letters.length === 5 ? (0.75 * windowHeight) / 10 : (0.6 * windowHeight) / 10;
  const cellSize = scaledSize(cellSizeTemp) >= 50 ? scaledSize(cellSizeTemp) : 50;

  useEffect(()=> {
    console.log(allWords);
  }, [allWords]);

  function leaveRoom(room) {
    console.log('Leaving room:', room);
    socket.emit('leaveRoom', { room, username });
  }
  useEffect(() => {
    if (isMultiplayer) {
      console.log('Route params:', route.params);
      socket.emit('joinRoom', { room, username });
    }
   
  }, []);


  function getUsersInRoom(room) {
    socket.emit('getUsersInRoom', room, (usersInRoom) => {
      console.log('Users in room:', usersInRoom);
    });
  }

  //Host generates letters
  useEffect(() => {
    if (!isGuest && isMultiplayer) {
    if (letters.length > 0 && !isGuest && !hasGeneratedLetters.current) {
      socket.emit('generateLetters', { room: room, letters: letters, selectedTime: selectedTime });
      hasGeneratedLetters.current = true;
    }
  }
  }, [letters, isGuest]);


  //Guest receives letters
  useEffect(() => {
    if (isGuest && isMultiplayer) {
    socket.on('generateLetters', ({ room, letters, selectedTime }) => {
      console.log('Received letters:', letters);
      console.log('Received time:', selectedTime);
      hasRecievedLetters.current = true;
      setLetters(letters);
      setTime(parseInt(selectedTime.split(' ')[0]) * 60);
    });

    return () => {
      socket.off('generateLetters');
    };
  }
  }, []);

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
    };
  };

  useEffect(() => {
    const unsubscribeInterstitialEvents = loadInterstitial();
    return () => {
      unsubscribeInterstitialEvents();
    };
  }, []);

  useEffect(() => {
    if (isValidWord(submitString) && !wordsUserFound.current.has(submitString)) {
      let currentScore = score;
      setPosAttempts(posAttempts + 1);
      currentScore += calcScore(submitString);
      setScore(currentScore);
      wordsUserFound.current.add(submitString);
      playCorrectSound(isSoundMuted);
    }
  }, [submitString]);

  const isValidWord = (word) => {
    if (!allWords || allWords.size === 0 || !word || word.length === 0) return false;
    return allWords.has(word.toLowerCase());
  };

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

  useEffect(() => {
    if (!hasRun.current && letters && Array.isArray(letters) && letters.length > 0 && Array.isArray(letters[0])) {
      if (isGuest && !hasRecievedLetters.current && isMultiplayer) {
        return;
      }
      var trie = new Trie();
      for (const letter in wordsMap) {
        if (wordsMap.hasOwnProperty(letter)) {
          for (const word of wordsMap[letter]) {
            trie.insert(word.toLowerCase());
          }
        }
      }

      const wordsToPathTemp = findWords(letters, trie);
      const wordOnly = wordsToPathTemp.map((entry) => entry.word);

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

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else if (isHapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setCurrentString(
      highlightedCells
        .map((cell) => {
          if (letters && letters[cell.row] && typeof letters[cell.row][cell.col] !== 'undefined') {
            return letters[cell.row][cell.col];
          }
          return null;
        })
        .filter(Boolean)
        .join('')
    );
    if (getDraggedString()) {
      playCellSound(highlightedCells.length - 1, isSoundMuted);
    }
  }, [highlightedCells]);

  const getDraggedString = () => {
    return highlightedCells
      .map((cell) => {
        if (letters && letters[cell.row] && typeof letters[cell.row][cell.col] !== 'undefined') {
          return letters[cell.row][cell.col];
        }
        return null;
      })
      .filter(Boolean)
      .join('');
  };

  const getCellFromCoordinates = (x, y) => {
    for (let row = 0; row < letters.length; row++) {
      for (let col = 0; col < (letters[0] || []).length; col++) {
        const cellLeft = col * (cellSize + 2 * MARGIN_BETWEEN_CELLS);
        const cellRight = cellLeft + cellSize;
        const cellTop = row * (cellSize + 2 * MARGIN_BETWEEN_CELLS);
        const cellBottom = cellTop + cellSize;

        if (x >= cellLeft && x <= cellRight && y >= cellTop && y <= cellBottom) {
          return { row, col };
        }
      }
    }
    return null;
  };

  useEffect(() => {
    switch (selectedMapIndex) {
      case 0:
        setLetters(generateLetters(4, 4, selectedMapIndex));
        break;
      case 1:
      case 2:
      case 3:
        setLetters(generateLetters(5, 5, selectedMapIndex));
        break;
      case 4:
      case 5:
      case 6:
        setLetters(generateLetters(6, 6, selectedMapIndex));
        break;
      default:
        break;
    }
  }, [selectedMapIndex]);

  useEffect(() => {
    if (isPaused) return;

    const timerId = setTimeout(async () => {
      if (time > 0) {
        setTime(time - 1);
      } else {
        if (interstitialLoaded) {
          interstitial.show();
        }
        if (!(isGuest && !hasRecievedLetters && isMultiplayer)) {
          navigateToPostGame();
        }
        
      }
    }, 1000);

    return () => clearTimeout(timerId);
  }, [time, isPaused, navigation, allWords, wordsUserFound, score, selectedTime]);

  const navigateToPostGame = async () => {
    const words = Array.from(wordsUserFound.current);
    const totalLength = words.reduce((acc, word) => acc + word.length, 0);
    const numberOfWords = words.length;
    const averageWordLength = numberOfWords > 0 ? totalLength / numberOfWords : 0;

    await updateAccuracy(userId, selectedTime, attempts, posAttempts);
    await updateTotalAvgLenForTime(userId, selectedTime, averageWordLength);
    await updateTotalScoreForTime(userId, selectedTime, score);
    await updateAllWordsUserFound(userId, words);
    await updateHighScoreIfNeeded(userId, selectedTime, score);
    await incrementGamesPlayed(userId, selectedTime);
    await checkAndUnlockMaps(userId);
  
    if (isMultiplayer) {
      socket.emit('postGameData', { room, foundWords: words });
      leaveRoom(room);
  
      // Navigate to PostGame for multiplayer
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'PostGameMultiplayer',
            params: {
              allWords: Array.from(allWords),
              foundWords: Array.from(wordsUserFound.current),
              userScore: score,
              selectedTime: selectedTime,
              wordsToPath: wordsToPath,
              letters: letters,
              room: room,
              opponent: opponent,
              attempts: attempts,
              posAttempts: posAttempts,
              averageWordLength: averageWordLength,
            },
          },
        ],
      });
    } else {
      // Navigate to PostGame for single player
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'PostGame',
            params: {
              allWords: Array.from(allWords),
              foundWords: Array.from(wordsUserFound.current),
              userScore: score,
              selectedTime: selectedTime,
              wordsToPath: wordsToPath,
              letters: letters,
                            attempts: attempts,
              posAttempts: posAttempts,
              averageWordLength: averageWordLength,
            },
          },
        ],
      });
    }
  };
  
  const checkAndUnlockMaps = async () => {
    const totalScore = await getStatForKey(userId, TOTAL_SCORE_KEY_PREFIX + selectedTime);
    const gamesPlayed = await getStatForKey(userId, GAMES_PLAYED_KEY_PREFIX + selectedTime);
    const allWordsUserFound = await getAllWordsUserFound(userId);
    const longestWordFound = Math.max(...Array.from(allWordsUserFound).map((word) => word.length), 0);

    const unlockedMaps = await getUnlockedMaps(userId);
    for (const mapOption of MAP_OPTIONS) {
      if (!unlockedMaps.includes(mapOption.idx)) {
        if (
          (mapOption.requiredScore && totalScore >= mapOption.requiredScore) ||
          (mapOption.requiredGamesPlayed && gamesPlayed >= mapOption.requiredGamesPlayed) ||
          (mapOption.requiredWordLength && longestWordFound >= mapOption.requiredWordLength)
        ) {
          await unlockMap(mapOption.idx);
        }
      }
    }
  };

  const isCellFilled = (rowIndex, colIndex) => {
    switch (selectedMapIndex) {
      case 2:
        return !((rowIndex === 0 || rowIndex === 4) && (colIndex === 0 || colIndex === 4) || (rowIndex === 2 && colIndex === 2));
      case 3:
        return (rowIndex + colIndex) % 2 === 0;
      case 5:
        return !(
          (rowIndex === 0 || rowIndex === 5) && (colIndex === 0 || colIndex === 5) ||
          (rowIndex === 2 && (colIndex === 2 || colIndex === 3)) ||
          (rowIndex === 3 && (colIndex === 2 || colIndex === 3))
        );
      case 6:
        return (rowIndex + colIndex) % 2 === 0;
      default:
        return true;
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      const touchX = evt.nativeEvent.pageX;
      const touchY = evt.nativeEvent.pageY;

      const relativeTouchX = touchX - viewPosition?.x;
      const relativeTouchY = touchY - viewPosition?.y;

      const cell = getCellFromCoordinates(relativeTouchX, relativeTouchY);

      if (cell && isCellFilled(cell.row, cell.col) && !highlightedCells.some((hCell) => hCell.row === cell.row && hCell.col === cell.col)) {
        setHighlightedCells((prev) => {
          const lastHighlighted = prev[prev.length - 1];
          if (
            lastHighlighted &&
            Math.abs(lastHighlighted.row - cell.row) <= 1 &&
            Math.abs(lastHighlighted.col - cell.col) <= 1 &&
            !visited.has(`${cell.row} ${cell.col}`)
          ) {
            visited.add(`${cell.row} ${cell.col}`);
            return [...prev, { row: cell.row, col: cell.col }];
          }
          if (prev.length === 0 && !visited.has(`${cell.row} ${cell.col}`)) {
            visited.add(`${cell.row} ${cell.col}`);
            return [{ row: cell.row, col: cell.col }];
          }
          return prev;
        });
      }
    },
    onPanResponderRelease: () => {
      setAttempts(attempts + 1);
      setHighlightedCells([]);
      setLines([]);
      setVisited(new Set());
      setSubmitString(getDraggedString());
    },
  });

  useEffect(() => {
    if (highlightedCells.length > 1) {
      const lastCell = highlightedCells[highlightedCells.length - 1];
      const secondLastCell = highlightedCells[highlightedCells.length - 2];

      const getCenterPoint = (row, col) => ({
        x: MARGIN_BETWEEN_CELLS + col * (cellSize + MARGIN_BETWEEN_CELLS * 2) + cellSize / 2,
        y: MARGIN_BETWEEN_CELLS + row * (cellSize + MARGIN_BETWEEN_CELLS * 2) + cellSize / 2,
      });

      const line = {
        start: getCenterPoint(secondLastCell.row, secondLastCell.col),
        end: getCenterPoint(lastCell.row, lastCell.col),
      };

      setLines((prevLines) => [...prevLines, line]);
    }
  }, [highlightedCells]);

  const renderCell = (isFilled, letter = '', rowIndex, colIndex) => {
    let isHighlighted = highlightedCells.some(
      (cell) =>
        cell.row === rowIndex && cell.col === colIndex &&
        rowIndex < letters.length && rowIndex >= 0 &&
        colIndex >= 0 && colIndex < letters.length &&
        letters[rowIndex][colIndex] !== ''
    );

    return (
      <BlurView
        {...panResponder.panHandlers}
        style={[
          styles.cell,
          isFilled ? styles.filledCell : styles.emptyCell,
          isHighlighted ? styles.highlightedCell : null,
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
              strokeWidth={`${cellSize / 5}`}
            />
          ))}
        </Svg>

        {letters.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            {row.map((letter, colIndex) => {
              let isFilled = true;

              switch (selectedMapIndex) {
                case 2:
                  if ((rowIndex === 0 || rowIndex === 4) && (colIndex === 0 || colIndex === 4) || (rowIndex === 2 && colIndex === 2)) {
                    isFilled = false;
                  }
                  break;
                case 3:
                  if ((rowIndex + colIndex) % 2 !== 0) {
                    isFilled = false;
                  }
                  break;
                case 5:
                  if (
                    (rowIndex === 0 || rowIndex === 5) && (colIndex === 0 || colIndex === 5) ||
                    (rowIndex === 2 && (colIndex === 2 || colIndex === 3)) ||
                    (rowIndex === 3 && (colIndex === 2 || colIndex === 3))
                  ) {
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
      color: isValidWord(currentString) && wordsUserFound.current.has(currentString)
        ? '#EED292'
        : isValidWord(currentString)
          ? 'rgb(0, 175, 155)'
          : 'white',
      fontSize: scaledSize(40),
      fontFamily: 'ComicSerifPro',
      alignSelf: 'center',
      marginTop: scaledSize(20),
      marginBottom: scaledSize(20),
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
      display: 'hidden',
      opacity: 0,
    },
    cellText: {
      color: 'white',
      fontSize: cellSize / 2,
      fontFamily: 'ComicSerifPro',
    },
    highlightedCell: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: scaledSize(5),
    },
    scoreContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      
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
      marginBottom: scaledSize(20),
    },
    closeButton: {
      marginTop: scaledSize(20),
      padding: scaledSize(12),
      borderRadius: scaledSize(15),
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: scaledSize(1),
      width: scaledSize(200),
    },
    closeButtonText: {
      fontFamily: 'ComicSerifPro',
      color: '#fff',
      fontSize: scaledSize(32),
      textAlign: 'center',
      alignSelf: 'center',
    },
    pauseButton: {
      borderRadius: scaledSize(15),
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: scaledSize(1),
      width: (letters?.length * (cellSize + 2 * MARGIN_BETWEEN_CELLS) - 2 * MARGIN_BETWEEN_CELLS) / 2 - scaledSize(5),
      marginBottom: scaledSize(5),
      marginTop: scaledSize(5),
      padding: scaledSize(10),
    },
    safeAreaContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionsContainer: {
      flexDirection: 'row',
      width: letters?.length * (cellSize + 2 * MARGIN_BETWEEN_CELLS) - 2 * MARGIN_BETWEEN_CELLS,
      justifyContent: 'space-between',
      alignItems: 'start',
      alignSelf: 'center',
    },
    timeScoreContainer: {
      flexDirection: 'column',
      justifyContent: 'start',
      width: (letters?.length * (cellSize + 2 * MARGIN_BETWEEN_CELLS) - 2 * MARGIN_BETWEEN_CELLS) / 2,
    },
    timeText: {
      color: time <= 5 ? '#ff0f0f' : 'white',
      fontSize: scaledSize(50),
      fontFamily: 'ComicSerifPro',
      marginTop: scaledSize(5),
      marginLeft: scaledSize(10),
    },
    scoreText: {
      color: 'white',
      fontSize: scaledSize(50),
      fontFamily: 'ComicSerifPro',
    },
    clockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scaledSize(10),
    },
    optionsButtonContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      display: 'flex',
    },
    soundButton: {
      borderRadius: scaledSize(15),
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: scaledSize(1),
      width: scaledSize(60),
      height: scaledSize(60),
      marginVertical: scaledSize(2.5),
      justifyContent: 'center',
    },
  });

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.optionsContainer}>
          <View style={styles.timeScoreContainer}>
            <View style={styles.clockContainer}>
              <FontAwesome name="clock-o" size={scaledSize(60)} color="#FFFFFF" />
              <Text style={styles.timeText}>
                {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
              </Text>
            </View>

            <View style={{ display: 'flex', flexDirection: 'row' }}>
              <Text style={styles.scoreText}>
                <ScoreCounter targetScore={score} />
              </Text>
            </View>
          </View>

          <View style={styles.optionsButtonContainer}>
            <TouchableOpacity style={styles.soundButton} onPress={() => { setIsPaused(true); playButtonSound(isSoundMuted); }}>
              <FontAwesome name="pause" size={scaledSize(40)} style={{ textAlign: 'center', color: 'white' }} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.soundButton} onPress={() => {
                setIsSoundMuted(!isSoundMuted);
                playButtonSound(isSoundMuted);
              }}>
                <FontAwesome style={{ textAlign: 'center' }} name={isSoundMuted ? 'volume-off' : 'volume-up'} size={scaledSize(40)} color={isSoundMuted ? 'gray' : '#fff'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.draggedString}>
            {!currentString ? ' ' : currentString && currentString.length >= 15 ? `${currentString.substring(0, 11)}...` : currentString}
          </Text>
          <Text style={styles.draggedString}>
            {isValidWord(currentString) && !wordsUserFound.current.has(currentString) ? "+" + calcScore(currentString) : ''}
          </Text>
        </View>

        <View style={styles.mapContainer} onLayout={onLayout} {...panResponder.panHandlers}>
          {renderMap()}
        </View>

        <View style={{ height: 50, marginTop: scaledSize(50) }}>
          <BannerAd
            unitId={adUnitIdBanner}
            size={BannerAdSize.LARGE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
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
          <TouchableOpacity onPress={() => { setIsPaused(false); playButtonSound(isSoundMuted); }} style={styles.closeButton}>
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
          <TouchableOpacity onPress={() => { setEndGameModal(true); }} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>End Game</Text>
          </TouchableOpacity>
          <ConfirmDialog
            title="Are you sure you want to end the game?"
            message="The stats for this game will not be counted."
            visible={endGameModal}
            onTouchOutside={() => setEndGameModal(false)}
            titleStyle={{ fontFamily: 'ComicSerifPro' }}
            messageStyle={{ fontFamily: 'ComicSerifPro' }}
            positiveButton={{
              title: "YES",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
                playButtonSound(isSoundMuted);
              },
              style: { fontFamily: 'ComicSerifPro', color: 'black' },
            }}
            negativeButton={{
              title: "NO",
              onPress: () => { playButtonSound(isSoundMuted); setEndGameModal(false); },
              style: { fontFamily: 'ComicSerifPro', color: 'black' },
            }}
          />
        </LinearGradient>
        <Rules modalVisible={modalVisible} setModalVisible={setModalVisible} />
      </Modal>
    </LinearGradient>
  );
}
