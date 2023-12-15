import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import GradientContext from "../GradientContext";
import Svg, { Line, Circle } from "react-native-svg";
import { scaledSize } from "../ScalingUtility";
import { FontAwesome } from "@expo/vector-icons";
import { Audio } from 'expo-av';
export default function WordDetailsScreen({ route }) {
  const { word, letters, wordsToPath, fromGame } = route.params;
  const [wordDetails, setWordDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { gradientColors } = useContext(GradientContext);
  const [soundObject, setSoundObject] = useState(null);
  const isCellInPath = (rowIndex, colIndex, path) => {
    return path.some(([row, col]) => rowIndex === row && colIndex === col);
  };

  const CELL_SIZE = scaledSize(60); 
  const OFFSET = scaledSize(20);
  const MARGIN_BETWEEN_CELLS = scaledSize(3);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: scaledSize(20),
      justifyContent: "flex-start",
    },
    loadingContainer: {
      flex: 1,
      padding: scaledSize(20),
      justifyContent: "center",
    },
    title: {
      fontSize: scaledSize(30),
      color: "#fff",
      fontFamily: "ComicSerifPro",
      textAlign: "center",
      marginBottom: scaledSize(20),
    },
    meaningContainer: {
      marginBottom: scaledSize(30),
    },
    scrollView: {
      marginTop: scaledSize(50),
      paddingBottom: scaledSize(50),
    },
    partOfSpeech: {
      fontSize: scaledSize(24),
      color: "#fff",
      fontFamily: "ComicSerifPro",
      textDecorationLine: "underline",
      marginBottom: scaledSize(10),
    },
    definition: {
      fontSize: scaledSize(20),
      color: "#fff",
      fontFamily: "ComicSerifPro",
      marginLeft: scaledSize(10),
      marginBottom: scaledSize(10),
    },
    errorTitle: {
      fontSize: scaledSize(28),
      color: "#fff",
      fontFamily: "ComicSerifPro",
      textAlign: "center",
      marginBottom: scaledSize(20),
    },
    errorResolution: {
      fontSize: scaledSize(20),
      color: "#fff",
      fontFamily: "ComicSerifPro",
      textAlign: "center",
    },
    board: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: scaledSize(10),
    },
    rowContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    cell: {
      width: CELL_SIZE - MARGIN_BETWEEN_CELLS,
      height: CELL_SIZE - MARGIN_BETWEEN_CELLS,
      lineHeight: CELL_SIZE - MARGIN_BETWEEN_CELLS,
      textAlign: "center",
      fontSize: scaledSize(24),
      color: "#fff",
      borderColor: "#fff",
      borderWidth: scaledSize(0.5),
      fontFamily: "ComicSerifPro",
      borderRadius: scaledSize(5),
      margin: MARGIN_BETWEEN_CELLS,
    },
    emptyCell: {
      width: CELL_SIZE - MARGIN_BETWEEN_CELLS,
      height: CELL_SIZE - MARGIN_BETWEEN_CELLS,
      lineHeight: CELL_SIZE - MARGIN_BETWEEN_CELLS,
      textAlign: "center",
      fontSize: scaledSize(24),
      color: "transparent",
      borderColor: "transparent",
      borderWidth: scaledSize(0.5),
      fontFamily: "ComicSerifPro",
      borderRadius: scaledSize(5),
      margin: MARGIN_BETWEEN_CELLS,
    },
    pathOverlay: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
});


  //fetch word info
  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then((response) => {
        setWordDetails(response.data[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError({
          title: "No Definitions Found",
          resolution: "",
        });
        setLoading(false);
      });
  }, [word]);


  
  useEffect(() => {
    // Load audio after fetching the word details
    const loadAudio = async () => {
        if (wordDetails && wordDetails.phonetics) {
            for (let phonetic of wordDetails.phonetics) {
                if (phonetic.audio) { // Check if the audio property exists and is non-empty
                    const sound = new Audio.Sound();
                    try {
                        await sound.loadAsync({ uri: phonetic.audio });
                        setSoundObject(sound);
                        break; // Exit the loop once we've found and loaded the first valid audio URL
                    } catch (error) {
                        console.error('Error loading word pronunciation', error);
                    }
                }
            }
        }
    };

    loadAudio();

    // This will unload the sound when the component is unmounted
    return () => {
        soundObject && soundObject.unloadAsync();
    };
}, [wordDetails]);


const playSound = async () => {
  if (soundObject) {
      try {
          // Stop the sound if it's currently playing
          await soundObject.stopAsync();
          
          // Start playing the sound from the beginning
          await soundObject.playAsync();
      } catch (error) {
          console.error('Error playing word pronunciation', error);
      }
  }
};


  if (loading) {
    return (
      <LinearGradient colors={gradientColors} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </LinearGradient>
    );
  }

  if (error ) {
    return (
      <LinearGradient colors={gradientColors} style={styles.container}>
        <SafeAreaView>
          <View style={styles.scrollView}>
            <Text style={styles.errorTitle}>{error.title}</Text>
            <Text style={styles.errorResolution}>
              Click
              <Text
                style={{ color: "#6C99C6" }}
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/search?q=${word}+definition`,
                  )
                }
              >
                {" "}
                here{" "}
              </Text>
              to search the web.
            </Text>
           {fromGame && <View style={styles.board}>
            {letters.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.rowContainer}>
                {row.map((letter, colIndex) => (
                  letter ?
                  <Text
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: isCellInPath(
                          rowIndex,
                          colIndex,
                          wordsToPath.filter((item) => item.word === word)[0]
                            .path,
                        )
                          ? "rgba(255, 255, 255, 0.3)"
                          : "transparent",
                      },
                    ]}
                  >
                    {letter}
                  </Text> : 
                  <Text
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={
                      styles.emptyCell
                    }
                  >
    
                  </Text> 
                  
           
                ))}
              </View>
            ))}
            <Svg
              height={
                letters.length * CELL_SIZE +
                (letters.length - 1) * MARGIN_BETWEEN_CELLS
              }
              width={
                letters[0].length * CELL_SIZE +
                (letters[0].length - 1) * MARGIN_BETWEEN_CELLS
              }
              style={styles.pathOverlay}
            >
              {wordsToPath
                .filter((item) => item.word === word)[0]
                .path.map((point, idx, array) => {
                  if (idx === 0) return null;
                  const [prevRow, prevCol] = array[idx - 1];
                  return (
                    <Line
                      key={`line-${idx}`}
                      x1={
                        prevCol * (CELL_SIZE + MARGIN_BETWEEN_CELLS) +
                        CELL_SIZE / 2
                      }
                      y1={
                        prevRow * (CELL_SIZE + MARGIN_BETWEEN_CELLS) +
                        CELL_SIZE / 2
                      }
                      x2={
                        point[1] * (CELL_SIZE + MARGIN_BETWEEN_CELLS) +
                        CELL_SIZE / 2
                      }
                      y2={
                        point[0] * (CELL_SIZE + MARGIN_BETWEEN_CELLS) +
                        CELL_SIZE / 2
                      }
                      stroke="white"
                      strokeWidth="2"
                      strokeOpacity={0.5}
                    />
                  );
                })}
            </Svg>
          </View>}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!wordDetails) return null;


  if (!fromGame) {
    return (
      <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView>
        <ScrollView style={styles.scrollView}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.title}>
              {wordDetails.word} 
            </Text>
          {soundObject && <TouchableOpacity onPress={playSound} style ={{marginBottom: scaledSize(20), marginLeft: scaledSize(5)}}>
              <FontAwesome name="volume-up" size={scaledSize(24)} color="white"/>
            </TouchableOpacity> }
          </View>
          {wordDetails.meanings.map((meaning, idx) => (
            <View key={idx} style={styles.meaningContainer}>
              <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
              {meaning.definitions.map((definition, defIdx) => (
                <Text key={defIdx} style={styles.definition}>
                  <Text>{"\u2022"}</Text> {definition.definition}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
    )
  }


  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView>
        <ScrollView style={styles.scrollView}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.title}>
              {wordDetails.word} 
            </Text>
          {soundObject && <TouchableOpacity onPress={playSound} style ={{marginBottom: scaledSize(20), marginLeft: scaledSize(5)}}>
              <FontAwesome name="volume-up" size={scaledSize(24)} color="white"/>
            </TouchableOpacity> }
          </View>
          {wordDetails.meanings.map((meaning, idx) => (
            <View key={idx} style={styles.meaningContainer}>
              <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
              {meaning.definitions.map((definition, defIdx) => (
                <Text key={defIdx} style={styles.definition}>
                  <Text>{"\u2022"}</Text> {definition.definition}
                </Text>
              ))}
            </View>
          ))}
         
         { fromGame && <View style={styles.board}>
            {letters.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.rowContainer}>
                {row.map((letter, colIndex) => (
                  letter ?
                  <Text
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: isCellInPath(
                          rowIndex,
                          colIndex,
                          wordsToPath.filter((item) => item.word === word)[0]
                            .path,
                        )
                          ? "rgba(255, 255, 255, 0.3)"
                          : "transparent",
                      },
                    ]}
                  >
                    {letter}
                  </Text> : 
                  <Text
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={
                      styles.emptyCell
                    }
                  >
    
                  </Text> 
                  
           
                ))}
              </View>
            ))}
            <Svg
              height={
                letters.length * CELL_SIZE +
                (letters.length - 1) * MARGIN_BETWEEN_CELLS
              }
              width={
                letters[0].length * CELL_SIZE +
                (letters[0].length - 1) * MARGIN_BETWEEN_CELLS
              }
              style={styles.pathOverlay}
            >
              {wordsToPath
                .filter((item) => item.word === word)[0]
                .path.map((point, idx, array) => {
                  if (idx === 0) return null;
                  const [prevRow, prevCol] = array[idx - 1];
                  return (
                    <Line
                      key={`line-${idx}`}
                      x1={
                        prevCol * (CELL_SIZE + MARGIN_BETWEEN_CELLS) +
                        CELL_SIZE / 2
                      }
                      y1={
                        prevRow * (CELL_SIZE + MARGIN_BETWEEN_CELLS) +
                        CELL_SIZE / 2
                      }
                      x2={
                        point[1] * (CELL_SIZE + MARGIN_BETWEEN_CELLS) +
                        CELL_SIZE / 2
                      }
                      y2={
                        point[0] * (CELL_SIZE + MARGIN_BETWEEN_CELLS) +
                        CELL_SIZE / 2
                      }
                      stroke="white"
                      strokeWidth="2"
                      strokeOpacity={0.5}
                    />
                  );
                })}
            </Svg>
          </View>}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
