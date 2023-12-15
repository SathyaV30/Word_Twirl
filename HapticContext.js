import { createContext } from 'react';

const HapticContext = createContext({
  isHapticEnabled: true,
  setIsHapticEnabled: () => {}, 
});

export const HapticProvider = HapticContext.Provider;
export const HapticConsumer = HapticContext.Consumer;

export default HapticContext;
