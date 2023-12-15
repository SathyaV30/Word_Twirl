import { createContext } from 'react';

const SoundContext = createContext({
  isSoundMuted: false,
  setIsSoundMuted: () => {},
});

export const SoundProvider = SoundContext.Provider;
export const SoundConsumer = SoundContext.Consumer;

export default SoundContext;
