import React, {useContext} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { playButtonSound } from '../AudioHelper';
import SoundContext from '../SoundContext';
export default function Rules({modalVisible, setModalVisible}) {
  const {isSoundMuted} = useContext(SoundContext)
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.modalContainer}>

        <Text style={styles.rulesTitleText}>Here are the rules:</Text>
        
        <Text style={styles.rulesModalText}>• Drag your finger around the board to find as many words as possible!</Text>
        <Text style={styles.rulesModalText}>• You can only drag to adjacent squares, no skipping over squares.</Text>
        <Text style={styles.rulesModalText}>
          • If a word appears in <Text style={{ color: 'rgb(0, 175, 155)' }}>green</Text>, it has not been found before.
        </Text>
        <Text style={styles.rulesModalText}>
          • If a word appears in <Text style={{ color: '#EED292' }}>yellow</Text>, it has been found before.
        </Text>
        <Text style={styles.rulesModalText}>• Longer words are awarded more points.</Text>
  
        
        <TouchableOpacity onPress={() => {setModalVisible(false); playButtonSound(isSoundMuted)} } style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Modal>
  )
}
const styles = StyleSheet.create({ 
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontFamily: 'ComicSerifPro',
    fontSize: (24),
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20
  },
  rulesModalText: {
    fontFamily: 'ComicSerifPro',
    fontSize: (22),
    color: '#fff',
    textAlign:'center',
    marginBottom: 20
  },
  rulesTitleText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: (40),
    marginBottom:20,
  },
  closeButton: {
    marginTop: 20,
    padding: (12),
    borderRadius: (15),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  closeButtonText: {
    fontFamily: 'ComicSerifPro',
    color: '#fff',
    fontSize: (20),
  },
})