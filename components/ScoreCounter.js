import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

export default function ScoreCounter({ targetScore }) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    let animationFrameId;

    if (currentScore !== targetScore) {
      animationFrameId = requestAnimationFrame(() => {
        const step = Math.ceil((targetScore - currentScore) / 10);
        setCurrentScore(prevScore => {
          const newScore = prevScore + step;
          return newScore > targetScore ? targetScore : newScore;
        });
      });
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [currentScore, targetScore]);

  return <Text>{currentScore}</Text>;
}
