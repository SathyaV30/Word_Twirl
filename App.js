import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import { loadCellSounds, loadButtonSound, loadCISounds } from './AudioHelper';
import SoundContext, { SoundProvider } from './SoundContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StylesScreen from './components/StylesScreen';
import GradientContext from './GradientContext';
import { getSelectedGradient, setSelectedGradient} from './StorageHelper';

import HapticContext from './HapticContext';
import Toast, { BaseToast } from 'react-native-toast-message';
import { scaledSize } from './ScalingUtility';

const Stack = createStackNavigator();

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'black' }}
      text2Style={{
        fontSize: scaledSize(20),
        fontFamily:'ComicSerifPro',
        color:'black'
      }}
    />
  ),

};
//Initiailize app and stack screens
export default function App() {
  // useEffect(()=> {
  //   const clearAsyncStorage = async () => {
  //     try {
  //         await AsyncStorage.clear();
  //         console.log('AsyncStorage has been cleared!');
  //     } catch (e) {
  //         console.error('Error clearing AsyncStorage:', e);
  //     }
  // };
  
  // clearAsyncStorage();
  // }, [])
  const initialRenderSound = useRef(true);
  const initialRenderHaptic = useRef(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [gradientColors, setGradientColors] = useState(null);
  const [isHapticEnabled, setIsHapticEnabled] = useState(true);

  const setAppGradient = async (newGradient) => {
    await setSelectedGradient(newGradient);
    setGradientColors(newGradient);
  };

  const loadSoundSettings = async () => {
    try {
      const soundMuted = await AsyncStorage.getItem('isSoundMuted');
      if (soundMuted !== null) setIsSoundMuted(JSON.parse(soundMuted));
    } catch (error) {
      console.error('Failed to load sound settings:', error);
    }
  };

   const saveSoundSettings = async () => {
    try {
      await AsyncStorage.setItem('isSoundMuted', JSON.stringify(isSoundMuted));

    } catch (error) {
      console.error('Failed to save sound settings:', error);
    }
  };

  const loadHapticSettings = async () => {
    try {
      const hapticEnabled = await AsyncStorage.getItem('isHapticEnabled');
      if (hapticEnabled !== null) {
        setIsHapticEnabled(JSON.parse(hapticEnabled));
      }
    } catch (error) {
      console.error('Failed to load haptic settings:', error);
    }
  };


  const saveHapticSettings = async () => {
    try {
      await AsyncStorage.setItem('isHapticEnabled', JSON.stringify(isHapticEnabled));
    } catch (error) {
      console.error('Failed to save haptic settings:', error);
    }
  };


  
  useEffect(() => {
    if (initialRenderSound.current) {
      initialRenderSound.current = false;
      return;
    }
    saveSoundSettings();
  }, [isSoundMuted]);
  
  useEffect(() => {
    if (initialRenderHaptic.current) {
      initialRenderHaptic.current = false;
      return;
    }
    saveHapticSettings();
  }, [isHapticEnabled]);


  const [fontsLoaded, fontError] = useFonts({
    'ComicSerifPro': require('./assets/fonts/HVD_Comic_Serif_Pro.otf'),
  });

 useEffect(() => {
    async function initializeData() {
 
        await loadSoundSettings();
        await loadButtonSound();
        await loadCellSounds();
        await loadCISounds();
        await loadHapticSettings();
       
        const chosenGradient = await getSelectedGradient();
        if (chosenGradient) {
            setGradientColors(chosenGradient);
        } else {
            setGradientColors(["#2E3192", "#1BFFFF"]); 
        }
    }
    
    initializeData();
}, []);


  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError || !gradientColors) {
    return null;
  }

  return ( 
    <HapticContext.Provider value = {{isHapticEnabled, setIsHapticEnabled}}>
    <GradientContext.Provider value={{gradientColors, setAppGradient}}>
  <SoundContext.Provider value={{ isSoundMuted, setIsSoundMuted }}>

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

 <Stack.Screen name="StylesScreen" component={StylesScreen} 
 options={{
  headerBackTitle:'Back',
  headerBackTitleStyle: {
    fontFamily: 'ComicSerifPro',
  },
  title:'',
}} />

  



      </Stack.Navigator>
      <Toast config={toastConfig} />
  </NavigationContainer>
  </SoundContext.Provider>
  </GradientContext.Provider>
  </HapticContext.Provider>
  
  );

}
