import React, { useState, useContext, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Alert, Modal, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { playButtonSound } from '../../Helper/AudioHelper';
import SoundContext from '../../Context/SoundContext';
const { width, height } = Dimensions.get('window');
import GradientContext from '../../Context/GradientContext';
import { MAP_OPTIONS } from './StylesScreen';
import { getUnlockedMaps, getStatForKey, getAllWordsUserFound, TOTAL_SCORE_KEY_PREFIX, GAMES_PLAYED_KEY_PREFIX } from '../../Helper/StorageHelper';
import { scaledSize } from '../../Helper/ScalingHelper';
import AuthContext from '../../Context/AuthContext';
import { getDocs, collection } from 'firebase/firestore';
import { FIRESTORE } from "../../Firebase/FirebaseConfig";
import { FontAwesome } from '@expo/vector-icons';
import socket from '../../Helper/Socket';




export default function StartScreen({ navigation, route }) {
  const { multiplayer } = route.params;
  const [selectedMap, setSelectedMap] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const selectedMapRef = useRef(selectedMap);
  const selectedTimeRef = useRef(selectedTime);


  const { isSoundMuted } = useContext(SoundContext);
  const { gradientColors } = useContext(GradientContext);
  const { userId, username } = useContext(AuthContext);
  const [unlockedMapIds, setUnlockedMapIds] = useState([]);
  const [opponent, setOpponent] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const opponentIdRef = useRef(opponentId);
  const opponentNameRef = useRef(opponent);
  const [userStats, setUserStats] = useState({
    score: 0,
    gamesPlayed: 0,
    maxWordLength: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [viewMode, setViewMode] = useState('selectOpponent'); 
  const isGuestRef = useRef(false);
  const MAX_REQUESTS = 3;
  



  useEffect(()=> {
    console.log(opponent);
    const friend = friends.find(friend => friend.username === opponent);
    if (friend) {
      setOpponentId(friend.id);
    } else {
      setOpponentId('');
    }
  }, [opponent])

  const availableMaps = MAP_OPTIONS.filter(mapOption => {
    if (unlockedMapIds.includes(mapOption.idx)) {
      return true;
    }
    if (mapOption.requiredScore && userStats.score < mapOption.requiredScore) {
      return false;
    }
    if (mapOption.requiredGamesPlayed && userStats.gamesPlayed < mapOption.requiredGamesPlayed) {
      return false;
    }
    if (mapOption.requiredWordLength && userStats.maxWordLength < mapOption.requiredWordLength) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    async function fetchUserStats() {
      const unlockedMaps = await getUnlockedMaps(userId);
      
      const statsPromises = ['1 min', '3 min', '5 min'].map(async (time) => {
        const score = await getStatForKey(userId, TOTAL_SCORE_KEY_PREFIX + time);
        const gamesPlayed = await getStatForKey(userId, GAMES_PLAYED_KEY_PREFIX + time);
        return { score, gamesPlayed };
      });
  
      const allStats = await Promise.all(statsPromises);
      const totalScore = allStats.reduce((total, stat) => total + stat.score, 0);
      const totalGamesPlayed = allStats.reduce((total, stat) => total + stat.gamesPlayed, 0);
      const allWords = await getAllWordsUserFound(userId);
      const maxWordLength = [...allWords].reduce((max, word) => Math.max(max, word.length), 0);
      setUserStats({
        score: totalScore,
        gamesPlayed: totalGamesPlayed,
        maxWordLength
      });
      setUnlockedMapIds(unlockedMaps);
    } 
  
    fetchUserStats();
  }, []);


  useEffect(()=> {
    console.log(selectedMap);
    selectedMapRef.current = selectedMap || selectedMap === 0 ? selectedMap : selectedMapRef.current;
  }, [selectedMap])

  useEffect(()=> {
    console.log(selectedTime);
    selectedTimeRef.current = selectedTime ? selectedTime : selectedTimeRef.current;
  }, [selectedTime])


  useEffect(()=> {
    console.log(opponentId);
    opponentIdRef.current = opponentId ? opponentId : opponentIdRef.current;
    
  }, [opponentId])

  useEffect(() => {
    console.log(opponent);
    opponentNameRef.current = opponent ? opponent : opponentNameRef.current;
  }, [opponent])

  

  useEffect(() => {
    const fetchFriends = async () => {
      const friendsSnapshot = await getDocs(collection(FIRESTORE, 'users', userId, 'friends'));
      let friendsData = friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setFriends(friendsData);
    };

    fetchFriends();
  }, [userId]);

  // Register user with the server
  useEffect(() => {
    if (multiplayer) {
    socket.emit('registerUser', { userId, username });
    }
  }, [userId, username]);

  function leaveRoom(room) {
    console.log('Leaving room:', room);
    socket.emit('leaveRoom', { room, username });
  }
  

useEffect(() => {
  if (multiplayer) {
    socket.on('gameRequest', ({ room, requester, map, time }) => {
      console.log('Map:', map, 'Time:', time);
      console.log('Incoming game request:', { room, requester });
      setIncomingRequests(prevRequests => [...prevRequests, { room, requester, map, time }]);
    });

    socket.on('gameAccepted', ({ room }) => {
      console.log('Game accepted, navigating to game:', room);
      leaveRoom(room); // Leave the room before navigating to the game (we rejoin in the game component)
      navigateToGame(room);
    });

    socket.on('requestFailed', ({ message }) => {
      Alert.alert('Game Request Failed', message);
    });

    socket.on('gameRequestDeclined', ({ room, guestUsername }) => {
      Alert.alert('Game Request Declined', `${guestUsername} has declined your game request.`);
      setSentRequests(sentRequests => {
        const updatedRequests = new Set(sentRequests);
        updatedRequests.delete(guestUsername);
        return updatedRequests;
      });
    });

    socket.on('gameRequestExpired', ({ room }) => {
      Alert.alert('Game Request Expired', 'The game request has expired.');
      setIncomingRequests(prevRequests => prevRequests.filter(req => req.room !== room));
    });

    return () => {
      socket.off('gameRequest');
      socket.off('gameAccepted');
      socket.off('requestFailed');
      socket.off('gameRequestDeclined');
      socket.off('gameRequestExpired');
    };
  }
}, [multiplayer]);



  function chooseOpponent() {
    setModalVisible(true);
  }

  function startGame() {
    if (!selectedMap && !selectedTime ) {
      Alert.alert("", "Please select a board and a time limit");
      return;
    } 
    if (!selectedMap && selectedMap !== 0) {
      Alert.alert("", "Please select a board");
      return;
    } 
    if (!selectedTime) {
      Alert.alert("", "Please select a time limit");
      return;
    }
    if (multiplayer && !opponent) {
      Alert.alert("", "Please select an opponent");
      return;
    }

    const room = `${userId}_${new Date().getTime()}`;
    socket.emit('joinRoom', { room, username });

    if (multiplayer) {
      const friend = friends.find(friend => friend.username === opponent);

      if (friend) {
        
        console.log('Sending game request:', { opponentId: friend.id, room:room, requester: username });
        if (sentRequests.size >= MAX_REQUESTS) {
          Alert.alert("", "You can only send 3 game requests at a time. Please wait for a response before sending another request.");
          return;
        }
        if (sentRequests.has(friend.username)) {
          Alert.alert("", "You have already sent a game request to this user. Please wait for a response before sending another request.");
          return; 
        }
        sentRequests.add(friend.username);
       
        socket.emit('gameRequest', { opponentId: friend.id, room, requester: username, map: selectedMap, time: selectedTime });
        Alert.alert("", "Game request sent! You will be automatically navigated to the game once your opponent accepts.");
      } else {
        console.error('Opponent not found:', opponent);
      }
    } else {
      navigateToGame(room);
    }
  }

  function acceptGameRequest(room, hostUser) {
    isGuestRef.current = true;
    opponentNameRef.current = hostUser;    
    socket.emit('acceptGame', { room });
  }
   
  function navigateToGame(room) {
    console.log('This is the oppoenent:', opponentNameRef);
    navigation.reset({
      index: 0,
      routes: [{
        name: 'Game',
        params: {
          selectedMapIndex: selectedMapRef.current,
          selectedTime: selectedTimeRef.current,
          room: room,
          isGuest: isGuestRef.current,
          opponentId: opponentIdRef.current,
          isMultiplayer: multiplayer,
          opponent: opponentNameRef.current
        }
      }],
    });
  }

  function renderShape(idx, inputParamSize, wantMargin) {
    const matrixSize = (idx === 0 ? 4 : idx == 1 || idx == 2 || idx == 3 ? 5 : 6); // 4x4, 5x5, 6x6
    const cellSizeTemp = ((inputParamSize) - matrixSize * 4) / matrixSize; 
    const cellSize = scaledSize(cellSizeTemp);
    const cellStyle = {
      width: cellSize,
      height: cellSize,
      margin:2,
      backgroundColor: 'gray'
    };


    const isCircleMap = (row, col) => {
      // Removing corners for circle map
      if (idx === 2) {
        return (row === 0 && (col === 0 || col === 4)) || 
               (row === 4 && (col === 0 || col === 4)) ||
               (row === 2 && col === 2);
      }
      if (idx === 5) {
        return (row === 0 && (col === 0 || col === 5)) || 
               (row === 5 && (col === 0 || col === 5)) ||
               (row === 2 && (col === 2 || col === 3)) || 
               (row === 3 && (col === 2 || col === 3));
      }
      return false;
    };

    const isCoolPattern = (row, col) => {
      if (idx === 3) {
        return (row + col) % 2 === 0;
      }
      if (idx === 6) {
        return (row + col) % 2 === 0;
      }
      return false;
    };

    return (
      <View style={{ flexDirection: 'column', width: scaledSize(inputParamSize), height: scaledSize(inputParamSize), marginRight: wantMargin ? scaledSize(inputParamSize/4) : 0, opacity: selectedMap === idx ? 0.5 : 1 }}>
        {Array(matrixSize).fill(null).map((_, row) => (
          <View style={{ flexDirection: 'row' }} key={row}>
            {Array(matrixSize).fill(null).map((_, col) => 
              isCircleMap(row, col) ? 
                <View style={{...cellStyle, backgroundColor: 'transparent'}} key={col}></View> :
                ((idx === 3 || idx==6) && !isCoolPattern(row, col)) ?
                <View style={{...cellStyle, backgroundColor: 'transparent'}} key={col}></View> :
                <View style={cellStyle} key={col}></View>
            )}
          </View>
        ))}
      </View>
    );
  }

  const renderFriendsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.toggleButtonsContainer}>
            <TouchableOpacity
              style={viewMode === 'selectOpponent' ? styles.activeToggleButton : styles.inactiveToggleButton}
              onPress={() => setViewMode('selectOpponent')}
            >
              <Text style={styles.toggleButtonText}>Select Opponent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={viewMode === 'gameRequests' ? styles.activeToggleButton : styles.inactiveToggleButton}
              onPress={() => setViewMode('gameRequests')}
            >
              <Text style={styles.toggleButtonText}>Game Requests</Text>
            </TouchableOpacity>
          </View>
          {viewMode === 'selectOpponent' ? (
            <>
              {friends.length <= 0 ? (
                <Text style={styles.modalAltText}>
                  Add some friends from the profile screen to challenge them as opponents!
                </Text>
              ) : (
                <FlatList
                  data={friends}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setOpponent(item.username);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item.username}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          ) : (
            <>
              {incomingRequests.length <= 0 ? (
                <Text style={styles.modalAltText}>No incoming game requests</Text>
              ) : (
                <FlatList
                  data={incomingRequests}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.modalItem}>
                      <Text style={styles.modalItemText}>{item.requester}</Text>
                      <View style={styles.mapPreviewContainer}>
                        {renderShape(item.map, 85, false)}
                        <Text style={styles.mapPreviewText}>{item.time}</Text>
                      </View>
                      <View style={styles.requestButtonsContainer}>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => acceptGameRequest(item.room, item.requester)}
                        >
                         <FontAwesome name="check" size={scaledSize(16)} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineButton}
                          onPress={() => {
                            socket.emit('declineGame', { room: item.room, guestUsername: username });
                            setIncomingRequests(prevRequests => prevRequests.filter(req => req.room !== item.room));
                          }}
                        >
                          <FontAwesome name="times" size={scaledSize(16)} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}
            </>
          )}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.header}>Select a board:</Text>
        <ScrollView horizontal={true} style={styles.imageScroll} contentContainerStyle={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {availableMaps.map(map => (
            <TouchableOpacity key={map.idx} onPress={() => { setSelectedMap(selectedMap === map.idx ? null : map.idx); playButtonSound(isSoundMuted); }}>
              {renderShape(map.idx, 120, true)}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View>
          <Text style={styles.header}>Select a time limit:</Text> 
          <View style={styles.buttonContainer}>
            {['1 min', '3 min', '5 min'].map(time => (
              <TouchableOpacity key={time} style={selectedTime === time ? styles.selectedButton : styles.button} onPress={() => { setSelectedTime(selectedTime === time ? null : time); playButtonSound(isSoundMuted); }}>
                <BlurView intensity={50} tint="light" style={styles.glassButton}>
                  <Text style={styles.buttonText}>{time}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View>
          {multiplayer && 
            <View>
              <Text style={styles.header}>Select an opponent:</Text> 
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => { chooseOpponent(); playButtonSound(isSoundMuted); }}
              >
                <BlurView intensity={50} tint="light" style={{...styles.glassButton, marginBottom: scaledSize(35)}}>
                  <Text style={styles.buttonText}>Opponent: {opponent ? opponent : "Choose opponent"}</Text>
                </BlurView>
              </TouchableOpacity>
            </View>
          }
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => { startGame(); playButtonSound(isSoundMuted); }}
          >
            <BlurView intensity={50} tint="light" style={styles.glassButton}>
              <Text style={styles.buttonText}>Start Game</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {renderFriendsModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaledSize(20),
  },
  header: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(38),
    marginVertical: scaledSize(35),
    color: 'white',
  },
  imageScroll: {
    flexGrow: 0,
    flexShrink: 1,
    paddingBottom: scaledSize(5),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaledSize(20),
  },
  button: {
    borderRadius: scaledSize(15),
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaledSize(20),
  },
  selectedButton: {
    borderRadius: scaledSize(15),
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaledSize(20),
    opacity: 0.4 // Grayed out
  },
  startButton: {
    borderRadius: scaledSize(15),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaledSize(10),
  },
  glassButton: {
    padding: scaledSize(24),
    borderRadius: scaledSize(15),
    minWidth: '100%',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: scaledSize(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: scaledSize(24),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: scaledSize(15),
    padding: scaledSize(20),
    alignItems: 'center',
    height:'70%'
  },
  toggleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: scaledSize(20),
  },
  activeToggleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: scaledSize(10),
    borderRadius: scaledSize(5),
    marginHorizontal: scaledSize(5),

  },
  inactiveToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: scaledSize(10),
    borderRadius: scaledSize(5),
    marginHorizontal: scaledSize(5),
  },
  toggleButtonText: {
    fontFamily: 'ComicSerifPro',
    color: 'black',
    fontSize: scaledSize(16),
  },
  modalHeader: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(24),
    marginBottom: scaledSize(20),
    color: 'black',
  },
  modalItem: {
    padding: scaledSize(10),
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    width: '100%',
    alignItems: 'center',
    display:'flex',
    flexDirection:'row',
    gap: scaledSize(4),
  },
  modalItemText: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(18),
    color: 'blue',
  },
  modalAltText: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(18),
    color: 'black',
  },
  requestButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: scaledSize(10),
    borderRadius: scaledSize(5),
  },
  declineButton: {
    backgroundColor: 'red',
    padding: scaledSize(10),
    borderRadius: scaledSize(5),
  },
  requestButtonText: {
    fontFamily: 'ComicSerifPro',
    color: 'white',
    fontSize: scaledSize(16),
  },
  closeModalButton: {
    marginTop: scaledSize(20),
    padding: scaledSize(10),
    backgroundColor: 'red',
    borderRadius: scaledSize(15),
  },
  closeModalButtonText: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(18),
    color: 'white',
  },
  mapPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPreviewText: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(14),
    color: 'gray',
  },
});
