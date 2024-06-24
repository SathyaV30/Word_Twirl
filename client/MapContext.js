import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MapContext = createContext();

export const useMap = () => {
  return useContext(MapContext);
};
