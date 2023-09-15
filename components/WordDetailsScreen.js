import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

export default function WordDetailsScreen({ route }) {
  const { word } = route.params;
  const [wordDetails, setWordDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => {
        setWordDetails(response.data[0]);
        setLoading(false);  // Moved here, after the word details are set
      })
      .catch(err => {
        console.error(err);
        setError({
          title: "No Definitions Found",
          resolution: ""
        });
        setLoading(false);  // Also moved here, after the error is set
      });
}, [word]);


  if (loading) {
    return (
        <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            </LinearGradient>
    )
  }

  if (error) {
    return (
        <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.container}>
        <SafeAreaView>
            <View style={styles.scrollView}>
                <Text style={styles.errorTitle}>{error.title}</Text>
                <Text style={styles.errorResolution}>
                    Click  
                     <Text style ={{color:'#6C99C6'}}onPress={() => Linking.openURL(`https://www.google.com/search?q=${word}+definition`)}> here </Text>
                    to search the web.
                </Text> 
            </View>
        </SafeAreaView>
    </LinearGradient>
    
    );
}


  if (!wordDetails) return null;

  return (
    <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.container}>
      <SafeAreaView>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>{wordDetails.word}</Text>
          {wordDetails.meanings.map((meaning, idx) => (
            <View key={idx} style={styles.meaningContainer}>
              <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
              {meaning.definitions.map((definition, defIdx) => (
                <Text key={defIdx} style={styles.definition}><Text>{'\u2022'}</Text> {definition.definition}</Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start'
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    textAlign: 'center',
    marginBottom: 20
  },
  meaningContainer: {
    marginBottom: 30
  },
  scrollView: {
    marginTop: 50
  },
  partOfSpeech: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    textDecorationLine: 'underline',
    marginBottom: 10
  },
  definition: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    marginLeft: 10,  // slight left padding for alignment
    marginBottom: 10
  },
  errorTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    textAlign: 'center',
    marginBottom: 20
  },
  errorResolution: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'ComicSerifPro',
    textAlign: 'center'
  },
  linkText: {
    color: '#0000EE',  // Change this to your preferred link color
    fontFamily: 'ComicSerifPro',
},

});
