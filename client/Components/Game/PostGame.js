import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { playButtonSound } from '../../Helper/AudioHelper';
import SoundContext from '../../Context/SoundContext';
import GradientContext from '../../Context/GradientContext';
import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { updateHighScoreIfNeeded, updateTotalScoreForTime } from '../../Helper/StorageHelper';
import { scaledSize } from '../../Helper/ScalingHelper';
import { adUnitIdRewarded } from '../../Helper/AdHelper';
import Swiper from 'react-native-swiper';

const rewardedAdv = RewardedAd.createForAdRequest(adUnitIdRewarded, {
    requestNonPersonalizedAdsOnly: true
});

export default function PostGame({ route, navigation }) {
    const { isSoundMuted } = useContext(SoundContext);
    const { allWords, foundWords, userScore, selectedTime, letters, wordsToPath, attempts, posAttempts, averageWordLength } = route.params;
    const { gradientColors } = useContext(GradientContext);
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const [score, setScore] = useState(userScore);
    const [rewarded, setRewarded] = useState(false);
    const [adLoadingText, setAdLoadingText] = useState('Watch a short video for double score?');

    // New state for AccuracyWheel and WordsFoundWheel
    const [displayMode, setDisplayMode] = useState('accuracy');
    const [wordsDisplayMode, setWordsDisplayMode] = useState('wordsFoundRatio');
    const accuracy = (posAttempts / attempts) * 100;
    const wordsFoundRatio = (foundWords.length / allWords.length) * 100;
    const fillAnimation = useRef(new Animated.Value(0)).current;
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const wordsFillAnimation = useRef(new Animated.Value(0)).current;
    const wordsFlipAnimation = useRef(new Animated.Value(0)).current;
    const animatedWordLength = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const unsubscribeLoaded = rewardedAdv.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setIsAdLoaded(true);
        });
        const unsubscribeEarned = rewardedAdv.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                setRewarded(true);
            },
        );

        rewardedAdv.load();

        // Start fill animations for AccuracyWheel and WordsFoundWheel
        Animated.timing(fillAnimation, {
            toValue: accuracy,
            duration: 1500,
            useNativeDriver: false,
        }).start();

        Animated.timing(wordsFillAnimation, {
            toValue: wordsFoundRatio,
            duration: 1500,
            useNativeDriver: false,
        }).start();

        Animated.timing(animatedWordLength, {
            toValue: averageWordLength,
            duration: 1500,
            useNativeDriver: false,
        }).start();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, []);

    const playAdForReward = () => {
        if (isAdLoaded) {
            rewardedAdv.show();
        } else {
            setAdLoadingText('Loading...')
        }
    }

    useEffect(() => {
        if (adLoadingText == 'Loading...' && isAdLoaded) {
            rewardedAdv.show();
        }
    }, [isAdLoaded, adLoadingText])

    const rewardUser = async () => {
        await updateTotalScoreForTime(selectedTime, score);
        await updateHighScoreIfNeeded(selectedTime, score * 2);
    }

    useEffect(() => {
        if (rewarded) {
            rewardUser();
            setScore(score * 2);
        }
    }, [rewarded]);

    const getPointValue = (word) => rewarded ? (word.length ** 2) * 2 : word.length ** 2;

    const sortedWords = Array.from(allWords).sort((a, b) => {
        const difference = b.length - a.length;
        return difference !== 0 ? difference : getPointValue(b) - getPointValue(a);
    });

    const sortedFoundWordsTemp = Array.from(foundWords).sort((a, b) => {
        const difference = b.length - a.length;
        return difference !== 0 ? difference : getPointValue(b) - getPointValue(a);
    });
    const sortedFoundWords = sortedFoundWordsTemp.map(word => word.toLowerCase());

    // Determine performance level based on accuracy, words found ratio, and average word length
    const getPerformanceLevel = (metric, cutoffs) => {
        let level = 'Novice';
        if (metric >= cutoffs.expert) {
            level = 'Expert';
        } else if (metric >= cutoffs.advanced) {
            level = 'Advanced';
        } else if (metric >= cutoffs.intermediate) {
            level = 'Intermediate';
        } else if (metric >= cutoffs.beginner) {
            level = 'Beginner';
        } else {
            level = 'Novice';
        }
        return level;
    };

    const accuracyCutoffs = {
        novice: 40,
        beginner: 60,
        intermediate: 75,
        advanced: 90,
        expert: 91,
    };

    const wordsFoundCutoffs = {
        '1 min': { novice: 3, beginner: 6, intermediate: 10, advanced: 15, expert: 20 },
        '3 min': { novice: 5, beginner: 10, intermediate: 15, advanced: 20, expert: 25 },
        '5 min': { novice: 8, beginner: 13, intermediate: 18, advanced: 23, expert: 30 },
    };

    const averageWordLengthCutoffs = {
        novice: 3,
        beginner: 3.5,
        intermediate: 4,
        advanced: 5,
        expert: 6,
    };

    const timeLimit = selectedTime.toString();
    const currentWordsFoundCutoffs = wordsFoundCutoffs[timeLimit];

    const accuracyLevel = getPerformanceLevel(accuracy, accuracyCutoffs);
    const wordsFoundLevel = getPerformanceLevel(wordsFoundRatio, currentWordsFoundCutoffs);
    const averageWordLengthLevel = getPerformanceLevel(averageWordLength, averageWordLengthCutoffs);

    const toggleDisplay = () => {
        Animated.sequence([
            Animated.timing(flipAnimation, {
                toValue: 180,
                duration: 0,
                useNativeDriver: true,
            }), 
            Animated.timing(flipAnimation, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();

        setDisplayMode(displayMode === 'accuracy' ? 'attempts' : 'accuracy');
    };

    const toggleWordsDisplay = () => {
        Animated.sequence([
            Animated.timing(wordsFlipAnimation, {
                toValue: 180,
                duration: 0,
                useNativeDriver: true,
            }), 
            Animated.timing(wordsFlipAnimation, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();

        setWordsDisplayMode(wordsDisplayMode === 'wordsFoundRatio' ? 'wordsFoundPercentage' : 'wordsFoundRatio');
    };

    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.mainContainer}>
                    <Text style={styles.score}>
                        Score: {rewarded ? `${userScore} x 2 = ${userScore * 2}` : userScore}
                    </Text>
                    
                    <Swiper
                        style={styles.wrapper}
                        showsButtons={false}
                        loop={true}
                        dotStyle={styles.dot}
                        activeDotStyle={styles.activeDot}
                    >
                        <View style={styles.slide}>
                            <View style={styles.wheelsRow}>
                                <View style={styles.wheelContainer}>
                                    <Text style={styles.wheelLabel}>Accuracy</Text>
                                    <TouchableOpacity onPress={toggleDisplay}>
                                        <AnimatedCircularProgress
                                            size={scaledSize(175)}
                                            width={scaledSize(15)}
                                            fill={fillAnimation}
                                            tintColor='#4BB543'
                                            backgroundColor="#3d5875"
                                            rotation={0} 
                                        >
                                            {(fill) => (
                                                <Animated.View
                                                    style={{
                                                        transform: [
                                                            {
                                                                rotateY: flipAnimation.interpolate({
                                                                    inputRange: [0, 180],
                                                                    outputRange: ['0deg', '180deg'],
                                                                }),
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    <Text style={styles.centerText}>
                                                        {displayMode === 'accuracy'
                                                            ? `${Math.round(fill)}%`
                                                            : `${posAttempts}/${attempts}`}
                                                    </Text>
                                                </Animated.View>
                                            )}
                                        </AnimatedCircularProgress>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.wheelContainer}>
                                    <Text style={styles.wheelLabel}>Words Found</Text>
                                    <TouchableOpacity onPress={toggleWordsDisplay}>
                                        <AnimatedCircularProgress
                                            size={scaledSize(175)}
                                            width={scaledSize(15)}
                                            fill={wordsFillAnimation}
                                            tintColor='#FFA500'
                                            backgroundColor="#3d5875"
                                            rotation={0} 
                                        >
                                            {(fill) => (
                                                <Animated.View
                                                    style={{
                                                        transform: [
                                                            {
                                                                rotateY: wordsFlipAnimation.interpolate({
                                                                    inputRange: [0, 180],
                                                                    outputRange: ['0deg', '180deg'],
                                                                }),
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    <Text style={styles.centerText}>
                                                        {wordsDisplayMode === 'wordsFoundRatio'
                                                            ? `${foundWords.length}/${allWords.length}`
                                                            : `${Math.round(fill)}%`}
                                                    </Text>
                                                </Animated.View>
                                            )}
                                        </AnimatedCircularProgress>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.wordLengthContainer}>
                                <Text style={styles.wordLengthLabel}>Average Word Length</Text>
                                <Animated.Text style={styles.wordLength}>
                                    {animatedWordLength.interpolate({
                                        inputRange: [0, averageWordLength],
                                        outputRange: [0, averageWordLength.toFixed(2)]
                                    }).toString()}
                                </Animated.Text>
                            </View>
                        </View>
                        <View style={styles.slide}>
                            <View style={styles.scrollViewsContainer}>
                                <ScrollView style={[styles.halfWidthScrollView, styles.fixedHeightScrollView]}>
                                    <Text style={styles.allWords}>All Words</Text>
                                    {sortedWords.map((word, index) => (
                                        <TouchableOpacity style={styles.wordContainer} key={index} onPress={() => navigation.navigate('WordDetailsScreen', { word, letters, wordsToPath, fromGame:true })}>
                                           <Text style={[styles.word, { textDecorationLine:foundWords.includes(word.toUpperCase()) ?  'line-through' :'none', textDecorationColor:'#FFF' }]}>{word}</Text>
                                            <Text style={styles.points}>{getPointValue(word)} pts</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <ScrollView style={[styles.halfWidthScrollView, styles.fixedHeightScrollView]}>
                                    <Text style={styles.allWords}>Found Words</Text>
                                    {sortedFoundWords.map((word, index) => (
                                        <TouchableOpacity style={styles.wordContainer} key={index} onPress={() => navigation.navigate('WordDetailsScreen', { word, letters, wordsToPath, fromGame:true })}>
                                            <Text style={styles.word}>{word.toLowerCase()}</Text>
                                            <Text style={styles.points}>{getPointValue(word)} pts</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        <View style={styles.slide}>
                            <View style={styles.performanceContainer}>
                                <Text style={styles.performanceLabel}>Performance Level</Text>
                                <Text style={styles.performanceMetric}>Accuracy: {accuracyLevel}</Text>
                                <Text style={styles.performanceMetric}>Words Found: {wordsFoundLevel}</Text>
                                <Text style={styles.performanceMetric}>Avg Word Length: {averageWordLengthLevel}</Text>
                            </View>
                        </View>
                    </Swiper>

                    <View style={styles.buttonContainer}>
                        {!rewarded &&
                            <TouchableOpacity style={styles.button} onPress={playAdForReward}>
                                <BlurView intensity={50} tint="light" style={styles.glassButton}>
                                    <Text style={styles.buttonTextSmall}>
                                        {adLoadingText}
                                    </Text>
                                </BlurView>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity style={styles.button} onPress={() => { navigation.navigate('Start Screen', {type:true}); playButtonSound(isSoundMuted) }}>
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
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        padding: scaledSize(20),
    },
    score: {
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        fontSize: scaledSize(36),
        marginBottom: scaledSize(20),
    },
    wrapper: {
        height: scaledSize(500),
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    wheelContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelLabel: {
        fontSize: scaledSize(32),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        marginBottom: scaledSize(10),
    },
    centerText: {
        fontSize: scaledSize(32),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
    },
    wordLengthContainer: {
        alignItems: 'center',
        marginTop: scaledSize(20),
    },
    wordLengthLabel: {
        fontSize: scaledSize(24),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
    },
    wordLength: {
        fontSize: scaledSize(48),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
    },
    scrollViewsContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    halfWidthScrollView: {
        width: '48%',
        margin: '1%',
    },
    fixedHeightScrollView: {
        height: scaledSize(450),
    },
    allWords: {
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        fontSize: scaledSize(24),
        textAlign: 'center',
        marginBottom: scaledSize(10),
    },
    wordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: scaledSize(1),
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        paddingVertical: scaledSize(10),
    },
    word: {
        fontSize: scaledSize(18),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
    },
    points: {
        fontSize: scaledSize(16),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
    },
    dot: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: scaledSize(8),
        height: scaledSize(8),
        borderRadius: scaledSize(4),
        marginLeft: scaledSize(3),
        marginRight: scaledSize(3),
        marginTop: scaledSize(3),
        marginBottom: scaledSize(3),
    },
    activeDot: {
        backgroundColor: '#fff',
        width: scaledSize(8),
        height: scaledSize(8),
        borderRadius: scaledSize(4),
        marginLeft: scaledSize(3),
        marginRight: scaledSize(3),
        marginTop: scaledSize(3),
        marginBottom: scaledSize(3),
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scaledSize(20),
    },
    button: {
        marginVertical: scaledSize(8),
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
        fontFamily: 'ComicSerifPro',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: scaledSize(20),
    },
    buttonTextSmall: {
        fontFamily: 'ComicSerifPro',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: scaledSize(16),
        textAlign: 'center',
    },
    performanceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    performanceLabel: {
        fontSize: scaledSize(32),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        marginBottom: scaledSize(20),
    },
    performanceMetric: {
        fontSize: scaledSize(24),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
    },
    performanceLevel: {
        fontSize: scaledSize(48),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        fontWeight: 'bold',
    },
});

