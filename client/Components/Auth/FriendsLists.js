import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDocs, collection, addDoc, deleteDoc, setDoc, doc, getDoc } from 'firebase/firestore';
import { FIRESTORE } from "../../Firebase/FirebaseConfig";
import GradientContext from "../../Context/GradientContext";
import { scaledSize } from "../../Helper/ScalingHelper";
import AuthContext from '../../Context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function FriendsList() {
  const { gradientColors } = useContext(GradientContext);
  const { userId, username, email } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestsUsernames, setRequestsUsernames] = useState([]);
  const [view, setView] = useState('allUsers'); // 'allUsers', 'friends', or 'requests'
  const [acceptCounter, setAcceptCounter] = useState(0);

  useEffect(() => {
    const fetchFriends = async () => {
      const friendsSnapshot = await getDocs(collection(FIRESTORE, 'users', userId, 'friends'));
      setFriends(friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchAllUsers = async () => {
      const usersSnapshot = await getDocs(collection(FIRESTORE, 'users'));
      setAllUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchRequests = async () => {
      const requestsSnapshot = await getDocs(collection(FIRESTORE, 'users', userId, 'friendRequests'));
      const requestsData = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestsData);

      const usernames = await Promise.all(requestsData.map(async (request) => {
        const requesterDoc = await getDoc(doc(FIRESTORE, 'users', request.requesterId));
        return { id: request.requesterId, username: requesterDoc.data().username, email: requesterDoc.data().email, requestId: request.id };
      }));
      setRequestsUsernames(usernames);
    };

    fetchFriends();
    fetchAllUsers();
    fetchRequests();
  }, [userId, acceptCounter]);

  const handleSendFriendRequest = async (friendId, friendUsername, friendEmail) => {
    const friendRequestsSnapshot = await getDocs(collection(FIRESTORE, 'users', friendId, 'friendRequests'));
    const existingRequest = friendRequestsSnapshot.docs.find(doc => doc.data().requesterId === userId);

    if (existingRequest) {
      alert('A friend request is already pending.');
    } else {
      await addDoc(collection(FIRESTORE, 'users', friendId, 'friendRequests'), { requesterId: userId, requesterUsername: username, requesterEmail: email });
      alert('Friend request sent!');
    }
  };

  const handleAccept = async (requesterId, requesterUsername, requesterEmail, requestId) => {
    // Add friend to current user's friends
    await setDoc(doc(FIRESTORE, 'users', userId, 'friends', requesterId), { userId: requesterId, username: requesterUsername, email: requesterEmail });
    // Add current user to requester's friends
    await setDoc(doc(FIRESTORE, 'users', requesterId, 'friends', userId), { userId, username, email });
    // Delete the friend request by requestId
    await deleteDoc(doc(FIRESTORE, 'users', userId, 'friendRequests', requestId));
    // Update the requests state
    setRequests(requests.filter(request => request.id !== requestId));
    setRequestsUsernames(requestsUsernames.filter(request => request.requestId !== requestId));
    setAcceptCounter(acceptCounter + 1);
  };

  const handleDecline = async (requestId) => {
    // Delete the friend request by requestId
    await deleteDoc(doc(FIRESTORE, 'users', userId, 'friendRequests', requestId));
    // Update the requests state
    setRequests(requests.filter(request => request.id !== requestId));
    setRequestsUsernames(requestsUsernames.filter(request => request.requestId !== requestId));
  };

  const handleDeleteFriend = async (friendId) => {
    // Remove friend from current user's friends
    await deleteDoc(doc(FIRESTORE, 'users', userId, 'friends', friendId));
    // Remove current user from friend's friends
    await deleteDoc(doc(FIRESTORE, 'users', friendId, 'friends', userId));
    // Update the friends state
    setFriends(friends.filter(friend => friend.id !== friendId));
  };

  const notInFriendsList = (username) => {
    return !friends.some(friend => friend.username === username);
  }

  const filteredUsers = allUsers.filter(user => user.username && user.username.includes(search) && user.id !== userId && notInFriendsList(user.username));
  const filteredFriends = friends.filter(friend => friend.username && friend.username.includes(search));
  const filteredRequests = requestsUsernames.filter(request => request.username && request.username.includes(search));

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.toggleButtonsContainer}>
        <TouchableOpacity
          style={view === 'allUsers' ? styles.activeToggleButton : styles.inactiveToggleButton}
          onPress={() => setView('allUsers')}
        >
          <Text style={styles.toggleButtonText}>All Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={view === 'friends' ? styles.activeToggleButton : styles.inactiveToggleButton}
          onPress={() => setView('friends')}
        >
          <Text style={styles.toggleButtonText}>Friends List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={view === 'requests' ? styles.activeToggleButton : styles.inactiveToggleButton}
          onPress={() => setView('requests')}
        >
          <Text style={styles.toggleButtonText}>Incoming Requests</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listView}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="white"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        <FlatList
          data={view === 'allUsers' ? filteredUsers : view === 'friends' ? filteredFriends : filteredRequests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemName}>{item.username}</Text>
              {view === 'allUsers' && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleSendFriendRequest(item.id, item.username, item.email)}
                >
                  <FontAwesome name="plus" size={scaledSize(20)} color="white" />
                </TouchableOpacity>
              )}
              {view === 'friends' && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleDeleteFriend(item.id)}
                >
                  <FontAwesome name="times" size={scaledSize(20)} color="white" />
                </TouchableOpacity>
              )}
              {view === 'requests' && (
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(item.id, item.username, item.email, item.requestId)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleDecline(item.requestId)}
                  >
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaledSize(16),
    justifyContent: 'center',
  },
  listView: {
    minHeight: '70%',
  },
  toggleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: scaledSize(20),
  },
  activeToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: 'white',
    fontSize: scaledSize(16),
  },
  searchInput: {
    height: scaledSize(40),
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: scaledSize(5),
    paddingHorizontal: scaledSize(10),
    marginBottom: scaledSize(20),
    color: 'white',
    fontFamily: 'ComicSerifPro'
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scaledSize(10),
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  itemName: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(18),
    color: 'white',
  },
  iconButton: {
    padding: scaledSize(10),
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#1e90ff',
    padding: scaledSize(10),
    borderRadius: scaledSize(5),
    marginRight: scaledSize(5),
  },
  declineButton: {
    backgroundColor: '#ff4500',
    padding: scaledSize(10),
    borderRadius: scaledSize(5),
  },
  buttonText: {
    fontFamily: 'ComicSerifPro',
    color: 'white',
    fontSize: scaledSize(16),
  },
});
