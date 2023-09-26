import { createContext } from 'react';

const GradientContext = createContext({
  gradientColors: null,
  setAppGradient: () => {},
});

export default GradientContext;
