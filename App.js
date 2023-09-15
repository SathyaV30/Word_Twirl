import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Main from './components/Main';
import StartScreen from './components/StartScreen';
import Game from './components/Game';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import PostGame from './components/PostGame';
import WordDetailsScreen from './components/WordDetailsScreen';
import Stats from './components/Stats';
import { loadCellSounds, loadButtonSound, loadCISounds, loadBGM } from './AudioHelper';
import { SoundProvider } from './SoundContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();



export default function App() {
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  useEffect(() => {
    loadSoundSettings();
  }, []);

  const loadSoundSettings = async () => {
    try {
      const soundMuted = await AsyncStorage.getItem('isSoundMuted');
      const musicMuted = await AsyncStorage.getItem('isMusicMuted');
      
      if (soundMuted !== null) setIsSoundMuted(JSON.parse(soundMuted));
      if (musicMuted !== null) setIsMusicMuted(JSON.parse(musicMuted));
    } catch (error) {
      console.error('Failed to load sound settings:', error);
    }
  };

  const saveSoundSettings = async () => {
    try {
      await AsyncStorage.setItem('isSoundMuted', JSON.stringify(isSoundMuted));
      await AsyncStorage.setItem('isMusicMuted', JSON.stringify(isMusicMuted));
    } catch (error) {
      console.error('Failed to save sound settings:', error);
    }
  };

  // Save to local storage whenever the state changes
  useEffect(() => {
    saveSoundSettings();
  }, [isSoundMuted, isMusicMuted]);

  const [fontsLoaded, fontError] = useFonts({
    'ComicSerifPro': require('./assets/fonts/HVD_Comic_Serif_Pro.otf'),
  });

  useEffect(() => {
    loadButtonSound();
    loadCellSounds();
    loadCISounds();
    loadBGM();
}, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return ( <SoundProvider value={{ isSoundMuted, setIsSoundMuted, isMusicMuted, setIsMusicMuted }}>

    
    <NavigationContainer onLayout={onLayoutRootView}>
   
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerTransparent: true,
          headerStyle: {
           backgroundColor:'transparent',
            elevation: 0, 
            shadowOpacity: 0, 
            borderBottomWidth: 0, 
          },
          headerBackImage: () => (
            <Ionicons name="ios-arrow-back" size={36} color="white" />
          ),
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'ComicSerifPro',
          },
        
      
        }}
        
        
      >
       <Stack.Screen 
  name="Main" 
  component={Main} 
  options={{ 
    headerShown: false,
    title: 'Main',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontFamily: 'ComicSerifPro',
    },
    headerBackTitleStyle: {
      fontFamily: 'ComicSerifPro',
    },
  }} 
/>

<Stack.Screen 
  name="Start Screen" 
  component={StartScreen}
  options={{
    headerBackTitle:'Back',
    headerBackTitleStyle: {
      fontFamily: 'ComicSerifPro',
    },
    title:'',
  }} 
/>
<Stack.Screen 
  name="Stats" 
  component={Stats}
  options={{
    headerBackTitle:'Back',
    headerBackTitleStyle: {
      fontFamily: 'ComicSerifPro',
    },
    title:'',
  }} 
/>
<Stack.Screen name="Game" component={Game} options={{
  headerShown:false
}} />

<Stack.Screen name="PostGame" component={PostGame} 
 options={{
  headerBackTitle:'Back',
  headerBackTitleStyle: {
    fontFamily: 'ComicSerifPro',
  },
  title:'',
}} />
<Stack.Screen name="WordDetailsScreen" component={WordDetailsScreen}  

    options={{
    headerBackTitle:'Back',
    headerBackTitleStyle: {
      fontFamily: 'ComicSerifPro',
    },
    title:'',
  }} />
  



      </Stack.Navigator>
    
  </NavigationContainer>
  </SoundProvider>
  );

}

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  font: {
    fontFamily:'ComicSerifPro',
  }
});
