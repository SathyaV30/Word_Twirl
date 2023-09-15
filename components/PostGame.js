import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { playButtonSound } from '../AudioHelper';
import SoundContext from '../SoundContext';

export default function PostGame({ route, navigation }) {
    const {isSoundMuted} = useContext(SoundContext)
    const { allWords, foundWords, userScore } = route.params;
    const getPointValue = (word) => word.length ** 2;

    const sortedWords = Array.from(allWords).sort((a, b) => {
        const difference = b.length - a.length;
        return difference !== 0 ? difference : getPointValue(b) - getPointValue(a);
    });
    const sortedFoundWords = Array.from(foundWords).sort((a, b) => {
        const difference = b.length - a.length;
        return difference !== 0 ? difference : getPointValue(b) - getPointValue(a);
    });

    return (
        <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.container}>
            <SafeAreaView>
                <View style={styles.mainContainer}>
                    <Text style={styles.score}>Score: {userScore} </Text>
                    <View style={styles.scrollViewsContainer}>
                        <ScrollView style={[styles.halfWidthScrollView, styles.fixedHeightScrollView]}>
                            <Text style={styles.allWords}>All Words</Text>
                            {sortedWords.map((word, index) => (
                                <TouchableOpacity style={styles.wordContainer} key={index} onPress={() => navigation.navigate('WordDetailsScreen', { word })}>
                                    <Text style={styles.word}>{word}</Text>
                                    <Text style={styles.points}>{getPointValue(word)} pts</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <ScrollView style={[styles.halfWidthScrollView, styles.fixedHeightScrollView]}>
        <Text style={styles.allWords}>Found Words</Text>
        {sortedFoundWords.map((word, index) => (
             <TouchableOpacity style={styles.wordContainer} key={index} onPress={() => navigation.navigate('WordDetailsScreen', { word })}>
                <Text style={styles.word}>{word.toLowerCase()}</Text>
                <Text style={styles.points}>{getPointValue(word)} pts</Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
                    </View>
                    <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate('Start Screen'); playButtonSound(isSoundMuted)}}>
        <BlurView intensity={50} tint="light" style={styles.glassButton}>
            <Text style={styles.buttonText}>New Game</Text>
        </BlurView>
    </TouchableOpacity>


    <TouchableOpacity style={styles.button} onPress={() =>  {navigation.reset({
          index: 0,
          routes: [{
            name: 'Main',
          }],
        }); playButtonSound(isSoundMuted); }}>
        <BlurView intensity={50} tint="light" style={styles.glassButton}>
            <Text style={styles.buttonText}>Home</Text>
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
        fontSize:36
    },
    allWords: {
        color:'#fff',
        fontFamily:'ComicSerifPro',
        fontSize:24,
        textAlign:'center'
    },
    scrollViewsContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    halfWidthScrollView: {
        width: '45%',
        margin: 10,
    },
    wordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        paddingVertical: 20,
    },
    word: {
        fontSize: 20,
        color: '#fff',
        fontFamily:'ComicSerifPro'
    },
    points: {
        fontSize: 18,
        color: '#fff',
        fontFamily:'ComicSerifPro'
    },
    viewButton: {
        alignItems: 'center',
        padding: 8,
        marginTop: 5,
        borderRadius: 15,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
    },
    glassButton: {
        padding: 16,
        borderRadius: 15,
        minWidth: '96.5%',
        alignItems: 'center',
        justifyContent: 'center',
        margin:5
    },
    buttonText: {
        fontFamily: 'ComicSerifPro',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 20,
    },
    mainContainer: {
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        marginTop:20
    },
    fixedHeightScrollView: {
        height: 555,  // This height corresponds to 8 rows. Adjust as needed.
    },
});
