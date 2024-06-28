import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking, Modal, TextInput, Alert } from 'react-native';
import { FontAwesome, Entypo, Ionicons } from '@expo/vector-icons';
import { getAuth, reauthenticateWithCredential, deleteUser, EmailAuthProvider } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { FIRESTORE } from '../../Firebase/FirebaseConfig';
import { scaledSize } from "../../Helper/ScalingHelper";
import { playButtonSound } from '../../Helper/AudioHelper';
import AuthContext from '../../Context/AuthContext';
import SoundContext from '../../Context/SoundContext';


const ProfileActions = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { logout, userId } = useContext(AuthContext);
  const {isSoundMuted} = useContext(SoundContext);



  const handleRating = () => {
    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/us/app/word-twirl/id6468644109'
      : 'https://play.google.com/store/apps/details?id=com.sathyav30.Word_Twirl';
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing word game! https://apps.apple.com/us/app/word-twirl/id6468644109',
        url: 'https://apps.apple.com/us/app/word-twirl/id6468644109'
      });
    } catch (error) {
      console.error('An error occurred while sharing', error);
    }
  };

  const handleFeedback = () => {
    Linking.openURL('mailto:sathyavenugopaldev@gmail.com').catch(err => console.error('An error occurred', err));
  };

  const handleAbout = () => {
    setModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(email, password);

      await reauthenticateWithCredential(user, credential);
      const userDocRef = doc(FIRESTORE, 'users', user.uid);
      await deleteDoc(userDocRef);
      await deleteUser(user);

      logout();

      Alert.alert('Account deleted', 'Your account has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
    setDeleteModalVisible(false);
  };

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionItem} onPress={handleRating}>
        <FontAwesome name="thumbs-up" size={24} color="white" />
        <Text style={styles.actionText}>Leave a rating</Text>
        <Entypo name="chevron-right" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
        <Entypo name="share" size={24} color="white" />
        <Text style={styles.actionText}>Share</Text>
        <Entypo name="chevron-right" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem} onPress={handleFeedback}>
        <Ionicons name="mail" size={24} color="white" />
        <Text style={styles.actionText}>Send feedback</Text>
        <Entypo name="chevron-right" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem} onPress={handleAbout}>
        <Ionicons name="information-circle" size={24} color="white" />
        <Text style={styles.actionText}>About the app</Text>
        <Entypo name="chevron-right" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => { playButtonSound(isSoundMuted); logout(); }}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => {playButtonSound(isSoundMuted); setDeleteModalVisible(true)}}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footerText}>Word Twirl version 1.0.3</Text>
      <Text style={styles.footerText}>Crafted with <FontAwesome name="heart" size={12} color="white" /> by Sathya Venugopal</Text>

      {/* About Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Word Twirl is an exciting word puzzle game that challenges your vocabulary skills.{"\n\n"}
              In this game, you'll be presented with a grid of letters and your task is to find as many words as possible by connecting adjacent letters. The longer the word, the more points you earn!{"\n\n"}
              Features:{"\n"}
              - Multiple game modes to test your word-finding skills{"\n"}
              - Beautiful and intuitive design{"\n"}
              - Interesting and fun to play board layouts{"\n"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.confirmButton} onPress={handleDeleteAccount}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    marginTop: scaledSize(30),
    width: '100%',
    paddingHorizontal: scaledSize(20),
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaledSize(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(18),
    color: 'white',
    flex: 1,
    marginLeft: scaledSize(10),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scaledSize(20),
  },
  button: {
    flex: 1,
    padding: scaledSize(12),
    borderRadius: scaledSize(10),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: scaledSize(1),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scaledSize(5),
  },
  buttonText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: scaledSize(18),
  },
  footerText: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(14),
    color: 'white',
    textAlign: 'center',
    marginTop: scaledSize(20),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: scaledSize(20),
    borderRadius: scaledSize(10),
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(20),
    color: 'black',
    marginBottom: scaledSize(10),
  },
  modalText: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(18),
    color: 'black',
    marginBottom: scaledSize(10),
  },
  input: {
    width: '100%',
    padding: scaledSize(12),
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: scaledSize(8),
    marginBottom: scaledSize(10),
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(16),
    color: 'black',
  },
  confirmButton: {
    backgroundColor: 'red',
    padding: scaledSize(12),
    borderRadius: scaledSize(10),
    alignItems: 'center',
    width: '100%',
    marginBottom: scaledSize(10),
  },
  confirmButtonText: {
    fontFamily: 'ComicSerifPro',
    color: 'white',
    fontSize: scaledSize(16),
  },
  modalClose: {
    fontFamily: 'ComicSerifPro',
    fontSize: scaledSize(16),
    color: 'blue',
    marginTop: scaledSize(10),
  },
});

export default ProfileActions;
