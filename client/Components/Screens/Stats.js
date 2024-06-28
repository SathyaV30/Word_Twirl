import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStatForKey, getAllWordsUserFound, GAMES_PLAYED_KEY_PREFIX, HIGH_SCORE_KEY_PREFIX, TOTAL_SCORE_KEY_PREFIX, TOTAL_AVG_LEN_PREFIX, ATTEMPTS_PREFIX, POS_ATTEMPTS_PREFIX } from '../../Helper/StorageHelper';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import GradientContext from '../../Context/GradientContext';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { scaledSize } from '../../Helper/ScalingHelper';
import { adUnitIdBanner } from '../../Helper/AdHelper';
import Toast from 'react-native-toast-message';
import AuthContext from '../../Context/AuthContext';

const Stats = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('All');
    const [stats, setStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { gradientColors } = useContext(GradientContext);
    const { userId } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const timeLimits = ['1 min', '3 min', '5 min'];
                let allStats = {};

                for (let time of timeLimits) {
                    const gamesPlayed = await getStatForKey(userId, GAMES_PLAYED_KEY_PREFIX + time);
                    const totalScore = await getStatForKey(userId, TOTAL_SCORE_KEY_PREFIX + time);
                    const totalAvgLenForTime = await getStatForKey(userId, TOTAL_AVG_LEN_PREFIX + time);
                    const highScore = await getStatForKey(userId, HIGH_SCORE_KEY_PREFIX + time);
                    const attempts = await getStatForKey(userId, ATTEMPTS_PREFIX + time);
                    const posAttempts = await getStatForKey(userId, POS_ATTEMPTS_PREFIX + time);

                    allStats[time] = {
                        gamesPlayed: gamesPlayed,
                        highScore: highScore,
                        totalScore: totalScore,
                        totalAvgLen: totalAvgLenForTime,
                        averageScore: gamesPlayed ? (totalScore / gamesPlayed).toFixed(2) : 0.00,
                        averageWordLength: gamesPlayed ? (totalAvgLenForTime / gamesPlayed).toFixed(2) : 0.00,
                        attempts: attempts,
                        posAttempts: posAttempts,
                        accuracy: attempts ? ((posAttempts * 100) / attempts).toFixed(2) : 0.00,
                    };
                }

                const allGamesPlayed = timeLimits.reduce((sum, time) => sum + allStats[time].gamesPlayed, 0);
                const allTotalScore = timeLimits.reduce((sum, time) => sum + allStats[time].totalScore, 0);
                const allTotalAvgWordLen = timeLimits.reduce((sum, time) => sum + allStats[time].totalAvgLen, 0);
                const allAttempts = timeLimits.reduce((sum, time) => sum + allStats[time].attempts, 0);
                const posAttempts = timeLimits.reduce((sum, time) => sum + allStats[time].posAttempts, 0);

                allStats['All'] = {
                    gamesPlayed: allGamesPlayed,
                    highScore: Math.max(...timeLimits.map(time => allStats[time].highScore)),
                    totalScore: allTotalScore,
                    averageScore: allGamesPlayed ? (allTotalScore / allGamesPlayed).toFixed(2) : 0.00,
                    averageWordLength: allGamesPlayed ? (allTotalAvgWordLen / allGamesPlayed).toFixed(2) : 0.00,
                    accuracy: allAttempts ? ((posAttempts * 100) / allAttempts).toFixed(2) : 0.00,
                };

                allStats['Words Found'] = {
                    wordsFound: Array.from(await getAllWordsUserFound(userId)).sort((a, b) => b.length - a.length),
                };

                setStats(allStats);
            } catch (error) {
                Toast.show({
                    type: 'errorTextSmall',
                    position: 'top',
                    visibilityTime: 1000,
                    autoHide: true,
                    topOffset: 30,
                    bottomOffset: 40,
                    text2: "An error has occurred.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <LinearGradient colors={gradientColors} style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <SafeAreaView style={styles.safeAreaContainer}>
                <View style={styles.tabs}>
                    {['All', '1 min', '3 min', '5 min', 'Words Found', 'Styles'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => {
                                setActiveTab(tab);
                                if (tab === 'Styles') {
                                    navigation.navigate("StylesScreen");
                                    setActiveTab('All');
                                }
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {Object.entries(stats)
                    .filter(([time]) => activeTab !== 'Words Found' && activeTab !== 'Styles' && time === activeTab)
                    .map(([time, data]) => (
                        <View key={time} style={styles.statContainer}>
                            <View style={styles.statItem}>
                                <FontAwesome name="gamepad" size={scaledSize(24)} color="white" style={styles.statIcon} />
                                <Text style={styles.statText}>Games Played: {data.gamesPlayed}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <FontAwesome name="trophy" size={scaledSize(24)} color="white" style={styles.statIcon} />
                                <Text style={styles.statText}>High Score: {data.highScore}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <FontAwesome name="star" size={scaledSize(24)} color="white" style={styles.statIcon} />
                                <Text style={styles.statText}>Total Score: {data.totalScore}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <FontAwesome name="calculator" size={scaledSize(24)} color="white" style={styles.statIcon} />
                                <Text style={styles.statText}>Avg Score: {data.averageScore}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <FontAwesome5 name="ruler-horizontal" size={scaledSize(24)} color="white" style={styles.statIcon} />
                                <Text style={styles.statText}>Avg Word length: {data.averageWordLength}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <FontAwesome5 name="check-circle" size={scaledSize(24)} color="white" style={styles.statIcon} />
                                <Text style={styles.statText}>Accuracy: {data.accuracy}%</Text>
                            </View>
                        </View>
                    ))}
                {activeTab === 'Words Found' && (
                    <View style={styles.wordListContainer}>
                        <TextInput
                            style={styles.searchBar}
                            placeholder="Search for words..."
                            placeholderTextColor="#fff"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        <Text style={styles.wordsFoundText}>{stats['Words Found'] ? stats['Words Found']?.wordsFound.length : 0} Words Found</Text>
                        <ScrollView style={styles.wordList}>
                            {Array.from(stats['Words Found']?.wordsFound || []).filter(word => word.toLowerCase().includes(searchTerm.toLowerCase())).map((word, index) => (
                                <TouchableOpacity key={index} style={styles.wordContainer} onPress={() => navigation.navigate('WordDetailsScreen', { word, letters: null, wordsToPath: null, fromGame: false })}>
                                    <Text style={styles.word}>{word.toLowerCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </SafeAreaView>
            <View style={{ marginBottom: scaledSize(35), alignSelf: 'center' }}>
                <BannerAd
                    unitId={adUnitIdBanner}
                    size={BannerAdSize.LARGE_BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true
                    }}
                />
            </View>
        </LinearGradient>
    );
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: scaledSize(20),
        display:'flex',
        justifyContent:'center'
    },
    safeAreaContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: scaledSize(70),
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
        fontSize: scaledSize(16)
    },
    activeTabText: {
        fontSize: scaledSize(18)
    },
    statContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: scaledSize(20)
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'left'
    },
    statIcon: {
        marginTop: scaledSize(4),
        marginRight: scaledSize(10),
    },
    searchBar: {
        height: scaledSize(40),
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: scaledSize(1),
        borderRadius: scaledSize(10),
        color: '#fff',
        paddingHorizontal: scaledSize(10),
        marginBottom: scaledSize(10),
        width: '90%',
        fontFamily: 'ComicSerifPro'
    },
    wordsFoundText: {
        fontFamily: 'ComicSerifPro',
        color: 'white',
    },
    wordListContainer: {
        flex: 1,
        width: '90%'
    },
    wordList: {
        flex: 1
    },
    wordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: scaledSize(1),
        borderBottomColor: '#fff',
        paddingVertical: scaledSize(20)
    },
    word: {
        fontSize: scaledSize(20),
        color: '#fff',
        fontFamily: 'ComicSerifPro'
    },
    statText: {
        fontSize: scaledSize(28),
        color: '#fff',
        fontFamily: 'ComicSerifPro',
        marginBottom: scaledSize(50),
        textAlign: 'center'
    },
});

export default Stats;
