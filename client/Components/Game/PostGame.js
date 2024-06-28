import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { playButtonSound } from '../../Helper/AudioHelper';
import SoundContext from '../../Context/SoundContext';
import GradientContext from '../../Context/GradientContext';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType, RewardedAd } from 'react-native-google-mobile-ads';
import { updateHighScoreIfNeeded, updateTotalScoreForTime } from '../../Helper/StorageHelper';
import { scaledSize } from '../../Helper/ScalingHelper';
import { adUnitIdRewarded } from '../../Helper/AdHelper';


const rewardedAdv = RewardedAd.createForAdRequest(adUnitIdRewarded, {
    requestNonPersonalizedAdsOnly: true
});

//Postgame screen
export default function PostGame({ route, navigation }) {
    const { isSoundMuted } = useContext(SoundContext);
    const { allWords, foundWords, userScore, selectedTime, letters, wordsToPath } = route.params;
    const { gradientColors } = useContext(GradientContext);
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const [score, setScore] = useState(userScore);
    const [rewarded, setRewared] = useState(false);
    const [adLoadingText, setAdLoadingText] = useState('Watch a short video for double score?');

    //Handle rewarded ad functions
    useEffect(() => {
        const unsubscribeLoaded = rewardedAdv.addAdEventListener(RewardedAdEventType.LOADED, () => {
          setIsAdLoaded(true);
     
        });
        const unsubscribeEarned = rewardedAdv.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          reward => {
            setRewared(true);
          },
        );

        rewardedAdv.load();
    

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
    
    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <SafeAreaView>
                <View style={styles.mainContainer}>
                    <Text style={styles.score}>
                        Score: {rewarded ? `${userScore} x 2 = ${userScore * 2}` : userScore}
                    </Text>
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
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    score: {
        color:'#fff',
        fontFamily:'ComicSerifPro',
        fontSize: scaledSize(36)
    },
    allWords: {
        color:'#fff',
        fontFamily:'ComicSerifPro',
        fontSize: scaledSize(24),
        textAlign:'center'
    },
    scrollViewsContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    halfWidthScrollView: {
        width: '45%',
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
        fontFamily:'ComicSerifPro',

    },
    points: {
        fontSize: scaledSize(18),
        color: '#fff',
        fontFamily:'ComicSerifPro'
    },
    viewButton: {
        alignItems: 'center',
        padding: scaledSize(8),
        marginTop: scaledSize(5),
        borderRadius: scaledSize(15),
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: scaledSize(1),
    },
    buttonContainer: {
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center'
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
        fontFamily:'ComicSerifPro',
        textAlign:'center',
    },
    overlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    button: {
        marginVertical: scaledSize(8),
    },
    mainContainer: {
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        marginTop: scaledSize(20)
    },
    fixedHeightScrollView: {
        height: scaledSize(555),
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
      textAlign:'center',
    },
    mainContainer: {
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        marginTop: scaledSize(20)
    },
    fixedHeightScrollView: {
        height: scaledSize(555),
    },
  });
  

