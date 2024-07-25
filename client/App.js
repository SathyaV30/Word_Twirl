import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Main from './Components/Screens/Main';
import StartScreen from './Components/Screens/StartScreen';
import Game from './Components/Game/Game';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import PostGame from './Components/Game/PostGame';
import WordDetailsScreen from './Components/Screens/WordDetailsScreen';
import Stats from './Components/Screens/Stats';
import { loadCellSounds, loadButtonSound, loadCISounds } from './Helper/AudioHelper';
import SoundContext from './Context/SoundContext';
import StylesScreen from './Components/Screens/StylesScreen';
import GradientContext from './Context/GradientContext';
import { getSelectedGradient, setSelectedGradient} from './Helper/StorageHelper';
import AuthContext, { AuthProvider } from './Context/AuthContext';
import HapticContext from './Context/HapticContext';
import Toast, { BaseToast } from 'react-native-toast-message';
import { scaledSize } from './Helper/ScalingHelper';
import Welcome from './Components/Screens/Welcome';
import SignUp from './Components/Auth/SignUp';
import Login from './Components/Auth/Login';
import Profile from './Components/Auth/Profile';
import VerifyEmail from './Components/Auth/VerifyEmail';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FriendsLists from './Components/Auth/FriendsLists';
import PostGameMultiplayer from './Components/Game/PostGameMultiplayer';
import socket from './Helper/Socket';
const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'green' }}
      text2Style={{
        fontSize: scaledSize(20),
        fontFamily: 'ComicSerifPro',
        color: 'black',
      }}
    />
  ),
  successTextSmall: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'green' }}
      text2Style={{
        fontSize: scaledSize(14),
        fontFamily: 'ComicSerifPro',
        color: 'black',
      }}
      text2NumberOfLines={2}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'red' }}
      text2Style={{
        fontSize: scaledSize(18),
        fontFamily: 'ComicSerifPro',
        color: 'black',
      }}
      text2NumberOfLines={2}
    />
  ),
  errorTextSmall: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'red' }}
      text2Style={{
        fontSize: scaledSize(14),
        fontFamily: 'ComicSerifPro',
        color: 'black',
      }}
      text2NumberOfLines={2}
    />
  ),
};

// Navigator for authenticated users
const MainNavigator = () => (
  <MainStack.Navigator
    initialRouteName="Main"
    screenOptions={{
      headerTransparent: true,
      headerStyle: {
        backgroundColor: 'transparent',
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
    <MainStack.Screen
      name="Main"
      component={Main}
      options={{
        headerShown: false,
      }}
    />
    <MainStack.Screen
      name="Start Screen"
      component={StartScreen}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
    <MainStack.Screen
      name="Stats"
      component={Stats}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
    <MainStack.Screen
      name="Profile"
      component={Profile}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
    <MainStack.Screen
      name="Game"
      component={Game}
      options={{
        headerShown: false,
      }}
    />
    <MainStack.Screen
      name="PostGame"
      component={PostGame}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
       <MainStack.Screen
      name="PostGameMultiplayer"
      component={PostGameMultiplayer}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
    <MainStack.Screen
      name="WordDetailsScreen"
      component={WordDetailsScreen}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
    <MainStack.Screen
      name="StylesScreen"
      component={StylesScreen}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />

<MainStack.Screen
      name="FriendsList"
      component={FriendsLists}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
  </MainStack.Navigator>
);

// Navigator for unauthenticated users
const AuthNavigator = () => (
  <AuthStack.Navigator
    initialRouteName="Welcome"
    screenOptions={{
      headerTransparent: true,
      headerStyle: {
        backgroundColor: 'transparent',
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
    <AuthStack.Screen
      name="Welcome"
      component={Welcome}
      options={{
        headerShown: false,
      }}
    />
    <AuthStack.Screen
      name="Login"
      component={Login}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
    <AuthStack.Screen
      name="SignUp"
      component={SignUp}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
    <AuthStack.Screen
      name="VerifyEmail"
      component={VerifyEmail}
      options={{
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'ComicSerifPro',
        },
        title: '',
      }}
    />
  </AuthStack.Navigator>
);

export default function App() {
  const initialRenderSound = useRef(true);
  const initialRenderHaptic = useRef(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [gradientColors, setGradientColors] = useState(null);
  const [isHapticEnabled, setIsHapticEnabled] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // useEffect(()=> {
  //   clearAsyncStorage();
  // }, []);

  


  const checkLoginStatus = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    const storedUsername = await AsyncStorage.getItem('username');
    const storedEmail = await AsyncStorage.getItem('email');
    if (storedUserId) {
      login(storedUserId, storedUsername, storedEmail);
    }
  };

  const login = async (userId, username, email) => {
    await AsyncStorage.setItem('userId', userId);
    await AsyncStorage.setItem('username', username);
    await AsyncStorage.setItem('email', email);
    setUserId(userId);
    setUsername(username);
    setEmail(email);
    setIsLoggedIn(true);
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('email');
    await clearAsyncStorage();
    setIsLoggedIn(false);
    setUserId('');
    setUsername('');
    setEmail('');
  };

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
      await checkLoginStatus();
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
    <AuthProvider value={{ isLoggedIn, userId, username, email, login, logout }}>
      <HapticContext.Provider value={{ isHapticEnabled, setIsHapticEnabled }}>
        <GradientContext.Provider value={{ gradientColors, setAppGradient }}>
          <SoundContext.Provider value={{ isSoundMuted, setIsSoundMuted }}>
            <NavigationContainer onLayout={onLayoutRootView}>
              {!isLoggedIn ? <AuthNavigator /> : <MainNavigator />}
              <Toast config={toastConfig} />
            </NavigationContainer>
          </SoundContext.Provider>
        </GradientContext.Provider>
      </HapticContext.Provider>
    </AuthProvider>
  );
}
