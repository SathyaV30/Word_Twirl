import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage keys
export const TOTAL_SCORE_KEY_PREFIX = 'totalScore_';
export const ALL_WORDS_USER_FOUND_KEY = 'allWordsUserFound';
export const HIGH_SCORE_KEY_PREFIX = 'highScore_';
export const GAMES_PLAYED_KEY_PREFIX = 'gamesPlayed_';  


// Helper functions

export const getTotalScoreForTime = async (time) => {
    const totalScore = await AsyncStorage.getItem(TOTAL_SCORE_KEY_PREFIX + time);
    return totalScore ? JSON.parse(totalScore) : 0;
};

export const updateTotalScoreForTime = async (time, newScore) => {
    const totalScore = await getTotalScoreForTime(time);
    await AsyncStorage.setItem(TOTAL_SCORE_KEY_PREFIX + time, JSON.stringify(totalScore + newScore));
};


export const getAllWordsUserFound = async () => {
    const words = await AsyncStorage.getItem(ALL_WORDS_USER_FOUND_KEY);
    return words ? new Set(JSON.parse(words)) : new Set();
};

export const updateAllWordsUserFound = async (newWords) => {
    const allWords = await getAllWordsUserFound();
    newWords.forEach(word => allWords.add(word));
    await AsyncStorage.setItem(ALL_WORDS_USER_FOUND_KEY, JSON.stringify(Array.from(allWords)));
};

export const getHighScore = async (time) => {
    const highScore = await AsyncStorage.getItem(HIGH_SCORE_KEY_PREFIX + time);
    return highScore ? JSON.parse(highScore) : 0;
};

export const updateHighScoreIfNeeded = async (time, newScore) => {
    const highScore = await getHighScore(time);
    if (newScore > highScore) {
        await AsyncStorage.setItem(HIGH_SCORE_KEY_PREFIX + time, JSON.stringify(newScore));
    }
};

export const getGamesPlayed = async (time) => {
    const gamesPlayed = await AsyncStorage.getItem(GAMES_PLAYED_KEY_PREFIX + time);
    return gamesPlayed ? JSON.parse(gamesPlayed) : 0;
};

export const incrementGamesPlayed = async (time) => {
    const gamesPlayed = await getGamesPlayed(time);
    await AsyncStorage.setItem(GAMES_PLAYED_KEY_PREFIX + time, JSON.stringify(gamesPlayed + 1));
};
export const getStatForKey = async (key) => {
    const stat = await AsyncStorage.getItem(key);
    return stat ? JSON.parse(stat) : 0;
};

