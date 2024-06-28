import {
    saveData,
    getData
  } from '../Firebase/Firestore'; 
  import AsyncStorage from '@react-native-async-storage/async-storage';
  export const TOTAL_SCORE_KEY_PREFIX = 'totalScore_';
  export const ALL_WORDS_USER_FOUND_KEY = 'allWordsUserFound';
  export const HIGH_SCORE_KEY_PREFIX = 'highScore_';
  export const GAMES_PLAYED_KEY_PREFIX = 'gamesPlayed_';  
  export const TOTAL_AVG_LEN_PREFIX = 'avgLen_';
  export const SELECTED_GRADIENT_KEY = 'selectedGradient';
  export const UNLOCKED_MAPS_KEY = 'unlockedMaps';
  export const LEVEL_KEY = 'level_';
  export const ATTEMPTS_PREFIX = 'attempts_';
  export const POS_ATTEMPTS_PREFIX = 'success_';
  export const PUZZLE_KEY = 'puzzle';
  
  export const getSavedFiles = async (userId) => {
    const savedPuzzles = await getData(userId, PUZZLE_KEY);
    return savedPuzzles ? savedPuzzles : [];
  };
  
  export const getUnlockedMaps = async (userId) => {
    const unlockedMaps = await getData(userId, UNLOCKED_MAPS_KEY);
    return unlockedMaps ? unlockedMaps : [];
  };
  
  export const unlockMap = async (userId, mapId) => {
    const unlockedMaps = await getUnlockedMaps(userId);
    if (!unlockedMaps.includes(mapId)) {
      unlockedMaps.push(mapId);
      await saveData(userId, UNLOCKED_MAPS_KEY, unlockedMaps);
    }
  };
  
  export const setSelectedGradient = async (gradient) => {
    await AsyncStorage.setItem(SELECTED_GRADIENT_KEY, JSON.stringify(gradient));
};


export const getSelectedGradient = async () => {
    const gradient = await AsyncStorage.getItem(SELECTED_GRADIENT_KEY);
    return gradient ? JSON.parse(gradient) : null;
};


  export const updateTotalScoreForTime = async (userId, time, newScore) => {
    const totalScore = await getStatForKey(userId, TOTAL_SCORE_KEY_PREFIX + time);
    await saveData(userId, TOTAL_SCORE_KEY_PREFIX + time, totalScore + newScore);
  };
  
  export const updateTotalAvgLenForTime = async (userId, time, newAvgLen) => {
    const totalAvgLen = await getStatForKey(userId, TOTAL_AVG_LEN_PREFIX + time);
    await saveData(userId, TOTAL_AVG_LEN_PREFIX + time, totalAvgLen + newAvgLen);
  };
  
  export const getAllWordsUserFound = async (userId) => {
    const words = await getData(userId, ALL_WORDS_USER_FOUND_KEY);
    return words ? new Set(words) : new Set();
  };
  
  export const updateAllWordsUserFound = async (userId, newWords) => {
    const allWords = await getAllWordsUserFound(userId);
    newWords.forEach(word => allWords.add(word));
    await saveData(userId, ALL_WORDS_USER_FOUND_KEY, Array.from(allWords));
  };
  
  export const updateHighScoreIfNeeded = async (userId, time, newScore) => {
    const highScore = await getStatForKey(userId, HIGH_SCORE_KEY_PREFIX + time);
    if (newScore > highScore) {
      await saveData(userId, HIGH_SCORE_KEY_PREFIX + time, newScore);
    }
  };
  
  export const updateAccuracy = async (userId, time, attempts, posAttempts) => {
    const prevAttempts = await getStatForKey(userId, ATTEMPTS_PREFIX + time);
    const prevPosAttempts = await getStatForKey(userId, POS_ATTEMPTS_PREFIX + time);
    await saveData(userId, ATTEMPTS_PREFIX + time, prevAttempts + attempts);
    await saveData(userId, POS_ATTEMPTS_PREFIX + time, prevPosAttempts + posAttempts);
  };
  
  export const incrementGamesPlayed = async (userId, time) => {
    const gamesPlayed = await getStatForKey(userId, GAMES_PLAYED_KEY_PREFIX + time);
    await saveData(userId, GAMES_PLAYED_KEY_PREFIX + time, gamesPlayed + 1);
  };
  
  export const getStatForKey = async (userId, key) => {
    const stat = await getData(userId, key);
    return stat ? stat : 0;
  };
  