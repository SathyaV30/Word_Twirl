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
import { getPerformanceLevel, accuracyCutoffs, wordsFoundCutoffs, averageWordLengthCutoffs, colorCutoffs } from '../../Helper/PerformanceHelper';
import Swiper from 'react-native-swiper';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const rewardedAdv = RewardedAd.createForAdRequest(adUnitIdRewarded, {
    requestNonPersonalizedAdsOnly: true
});


 const performanceColors = {
    novice: '#d60000',
    beginner: '#d4b401',
    intermediate: '#c4d600',
    advanced: '#67bf16',
    expert: '#2acf06',
};


export default function PostGame({ route, navigation }) {

    const { isSoundMuted } = useContext(SoundContext);
    const { allWords, foundWords, userScore, selectedTime, letters, wordsToPath, attempts, posAttempts, averageWordLength } = route.params;
    const { gradientColors } = useContext(GradientContext);
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const [score, setScore] = useState(userScore);
    const [rewarded, setRewarded] = useState(false);
    const [adLoadingText, setAdLoadingText] = useState('Watch a short video for double score?');

    const [displayMode, setDisplayMode] = useState('accuracy');
    const [wordsDisplayMode, setWordsDisplayMode] = useState('wordsFoundRatio');
    const accuracy = (posAttempts / attempts) * 100;
    const wordsFoundRatio = (foundWords.length / allWords.length) * 100;
    const fillAnimation = useRef(new Animated.Value(0)).current;
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const wordsFillAnimation = useRef(new Animated.Value(0)).current;
    const wordsFlipAnimation = useRef(new Animated.Value(0)).current;
    const animatedWordLength = useRef(new Animated.Value(0)).current;

    const wordLengthColor = animatedWordLength.interpolate({
        inputRange: [2, 2.5, 3, 3.5, 4],
        outputRange: [performanceColors.novice, performanceColors.beginner, performanceColors.intermediate, performanceColors.advanced, performanceColors.expert],
    });

    const wordLengthDistribution = Array.from(new Set(allWords.map(word => word.length)))
        .sort((a, b) => a - b) // Ensure bars are in increasing order of word length
        .map(length => ({
            length,
            total: allWords.filter(word => word.length === length).length,
            found: foundWords.filter(word => word.length === length).length,
        }));

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

    const timeLimit = selectedTime.toString();
    const currentWordsFoundCutoffs = wordsFoundCutoffs[timeLimit];

    const accuracyObj = getPerformanceLevel(accuracy, accuracyCutoffs);
    const wordsFoundObj = getPerformanceLevel(wordsFoundRatio, currentWordsFoundCutoffs);
    const averageWordLengthObj = getPerformanceLevel(averageWordLength, averageWordLengthCutoffs);
    const accuracyLevel = accuracyObj.level;
    const wordsFoundLevel = wordsFoundObj.level;
    const averageWordLengthLevel = averageWordLengthObj.level;
    const accuracyColor = accuracyObj.color;
    const wordsFoundColor = wordsFoundObj.color;
    const averageWordLengthColor = averageWordLengthObj.color;

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
                            <View style={styles.scrollViewsContainer}>
                                <ScrollView style={[styles.halfWidthScrollView, styles.fixedHeightScrollView]}>
                                    <Text style={styles.allWords}>All Words</Text>
                                    {sortedWords.map((word, index) => (
                                        <TouchableOpacity style={styles.wordContainer} key={index} onPress={() => navigation.navigate('WordDetailsScreen', { word, letters, wordsToPath, fromGame:true })}>
                                           <Text style={[styles.word, { textDecorationLine:foundWords.includes(word.toUpperCase()) ?  'line-through' :'none', textDecorationColor:'#FF0000' }]}>{word}</Text>
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
                            <View style={styles.wheelsRow}>
                                <View style={styles.wheelContainer}>
                                    <Text style={styles.wheelLabel}>Accuracy</Text>
                                    <TouchableOpacity onPress={toggleDisplay}>
                                        <AnimatedCircularProgress
                                            size={scaledSize(125)}
                                            width={scaledSize(12)}
                                            fill={Number.parseInt(JSON.stringify(fillAnimation))}
                                            tintColor={accuracyColor}
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
                                            size={scaledSize(125)}
                                            width={scaledSize(12)}
                                            fill={Number.parseInt(JSON.stringify(wordsFillAnimation))}
                                            tintColor={wordsFoundColor}
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
                                <Text style={styles.wordLengthLabel}>Avg Word Length: {averageWordLength.toFixed(2)}</Text>
                                <View style={[styles.wordLengthBarOutline, { backgroundColor: '#3d5875' }]}>
                                    <Animated.View
                                        style={[
                                            styles.wordLengthBar,
                                            {
                                                backgroundColor: wordLengthColor,
                                                width: animatedWordLength.interpolate({
                                                    inputRange: [2, 4],
                                                    outputRange: ['0%', '100%'],
                                                }),
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.rangeContainer}>
                                    <Text style={styles.rangeText}>2</Text>
                                    <Text style={styles.rangeText}>2.5</Text>
                                    <Text style={styles.rangeText}>3</Text>
                                    <Text style={styles.rangeText}>3.5</Text>
                                    <Text style={styles.rangeText}>4</Text>
                                </View>
                                <View style={styles.wordDistributionContainer}>
                                    <Text style={styles.wordDistributionLabel}>Word Length Distribution</Text>
                                    <View style={styles.wordDistributionChart}>
                                        {wordLengthDistribution.map(({ length, total, found }) => (
                                            <View key={length} style={styles.wordDistributionBarContainer}>
                                                <Text style={styles.wordDistributionBarLabel}>{length}</Text>
                                                <View style={styles.wordDistributionBarBackground}>
                                                    <Animated.View
                                                        style={[
                                                            styles.wordDistributionBar,
                                                            {
                                                                height: `${(found / total) * 100}%`,
                                                                backgroundColor: wordLengthColor,
                                                            },
                                                        ]}
                                                    />
                                                </View>
                                                <Text style={styles.wordDistributionBarCount}>{found}/{total}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                 
                        <View style={styles.slide}>
                            <View style={styles.performanceContainer}>
                                <Text style={styles.performanceLabel}>Performance Level</Text>
                                <View style={styles.performanceContainer}>
                                    <Text style={styles.performanceMetric}>
                                        Accuracy: <Text style={{ color: accuracyColor }}>{accuracyLevel}</Text>
                                    </Text>
                                    <Text style={styles.performanceMetric}>
                                        Words Found: <Text style={{ color: wordsFoundColor }}>{wordsFoundLevel}</Text>
                                    </Text>
                                    <Text style={styles.performanceMetric}>
                                        Avg Word Length: <Text style={{ color: averageWordLengthColor }}>{averageWordLengthLevel}</Text>
                                    </Text>
                                </View>
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
        justifyContent: 'flex-start',
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
        fontSize: scaledSize(24),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        marginBottom: scaledSize(10),
    },
    centerText: {
        fontSize: scaledSize(26),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
    },
    wordLengthContainer: {
        alignItems: 'center',
        marginTop: scaledSize(20),
        width: '100%',
    },
    wordLengthLabel: {
        fontSize: scaledSize(24),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
    },
    wordLengthBarOutline: {
        height: scaledSize(22.5),
        width: '80%',
        borderColor: '#3d5875',
        borderWidth: 1,
        borderRadius: scaledSize(7.5),
        overflow: 'hidden',
        marginTop: scaledSize(10),
    },
    wordLengthBar: {
        height: '100%',
        borderRadius: scaledSize(7.5),
    },
    rangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: scaledSize(10),
    },
    rangeText: {
        fontSize: scaledSize(16),
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
        justifyContent: 'flex-start',
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
        marginBottom: scaledSize(10),
    },
    performanceLevel: {
        fontSize: scaledSize(48),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        fontWeight: 'bold',
    },
    wordDistributionContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: scaledSize(20),
    },
    wordDistributionLabel: {
        fontSize: scaledSize(24),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        marginBottom: scaledSize(10),
    },
    wordDistributionChart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    wordDistributionBarContainer: {
        alignItems: 'center',
    },
    wordDistributionBarLabel: {
        fontSize: scaledSize(16),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        marginBottom: scaledSize(5),
    },
    wordDistributionBarBackground: {
        width: scaledSize(20),
        height: scaledSize(100),
        backgroundColor: '#3d5875',
        borderRadius: scaledSize(5),
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    wordDistributionBar: {
        width: '100%',
        borderRadius: scaledSize(5),
    },
    wordDistributionBarCount: {
        fontSize: scaledSize(16),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        marginTop: scaledSize(5),
    },
});
