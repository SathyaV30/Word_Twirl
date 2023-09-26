import { Audio } from 'expo-av';
let buttonSound;
let correctSound;
let incorrectSound;
let bgm;
const cellSounds = [];
const VOLUME_LEVEL = 0.25;

const soundFiles = [
    require('./assets/sounds/cells/1.wav'),
    require('./assets/sounds/cells/2.wav'),
    require('./assets/sounds/cells/3.wav'),
    require('./assets/sounds/cells/4.wav'),
    require('./assets/sounds/cells/5.wav'),
    require('./assets/sounds/cells/6.wav'),
    require('./assets/sounds/cells/7.wav'),
    require('./assets/sounds/cells/8.wav'),
    require('./assets/sounds/cells/9.wav'),
    require('./assets/sounds/cells/10.wav'),
    require('./assets/sounds/cells/11.wav'),
    require('./assets/sounds/cells/12.wav'),
    require('./assets/sounds/cells/13.wav'),
    require('./assets/sounds/cells/14.wav'),
    require('./assets/sounds/cells/15.wav'),
    require('./assets/sounds/cells/16.wav'),
    require('./assets/sounds/cells/17.wav'),
    require('./assets/sounds/cells/18.wav'),
    require('./assets/sounds/cells/19.wav'),
    require('./assets/sounds/cells/20.wav'),
    require('./assets/sounds/cells/21.wav'),
    require('./assets/sounds/cells/22.wav'),
    require('./assets/sounds/cells/23.wav'),
    require('./assets/sounds/cells/24.wav'),
    require('./assets/sounds/cells/25.wav'),
    require('./assets/sounds/cells/26.wav'),
    require('./assets/sounds/cells/27.wav'),
    require('./assets/sounds/cells/28.wav'),
    require('./assets/sounds/cells/29.wav'),
    require('./assets/sounds/cells/30.wav'),
    require('./assets/sounds/cells/31.wav'),
    require('./assets/sounds/cells/32.wav'),
    require('./assets/sounds/cells/33.wav'),
    require('./assets/sounds/cells/34.wav'),
    require('./assets/sounds/cells/35.wav'),
    require('./assets/sounds/cells/36.wav')
  ];
  
//Helper functions for load/play/stop audio.
export async function loadBGM() {
    if (!bgm) {
        const soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync(require('./assets/sounds/bgm.wav'));
            bgm = soundObject;
        } catch (error) {
            console.error('Error loading button sound', error);
        }
    }
}

export async function loadButtonSound() {
    if (!buttonSound) {
        const soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync(require('./assets/sounds/buttonClick.wav'));
            buttonSound = soundObject;
        } catch (error) {
            console.error('Error loading button sound', error);
        }
    }
}

export async function loadCellSounds() {
    for (let i = 0; i < 36; i++) {
        const soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync(soundFiles[i]);
            cellSounds.push(soundObject);
        } catch (error) {
            console.error('Error loading cell sound', error);
        }
    }
}
export async function loadCISounds() {
    if (!correctSound) {
        const correctSoundObject = new Audio.Sound();
        try {
            await correctSoundObject.loadAsync(require('./assets/sounds/correct.wav'));
            correctSound = correctSoundObject;
        } catch (error) {
            console.error('Error loading correct sound', error);
        }
    }

    if (!incorrectSound) {
        const incorrectSoundObject = new Audio.Sound();
        try {
            await incorrectSoundObject.loadAsync(require('./assets/sounds/incorrect.wav'));
            incorrectSound = incorrectSoundObject;
        } catch (error) {
            console.error('Error loading incorrect sound', error);
        }
    }
}

export async function playButtonSound(isSoundMuted) {
    if (buttonSound && !isSoundMuted) {
        try {
            await buttonSound.stopAsync();
            await buttonSound.setPositionAsync(0);
            await buttonSound.setVolumeAsync(VOLUME_LEVEL);
            await buttonSound.playAsync();
        } catch (error) {
            console.error('Error playing button sound', error);
        }
    }
}

export async function playCellSound(index,isSoundMuted) {
    if (cellSounds[index] && !isSoundMuted) {
        try {
            await cellSounds[index].stopAsync();
            await cellSounds[index].setPositionAsync(0);
            await cellSounds[index].setVolumeAsync(VOLUME_LEVEL);
            await cellSounds[index].playAsync();
        } catch (error) {
            console.error('Error playing cell sound', error);
        }
    }
}
export async function playCorrectSound(isSoundMuted) {
    if (correctSound && !isSoundMuted) {
        try {
            await correctSound.stopAsync();
            await correctSound.setPositionAsync(0);
            await correctSound.setVolumeAsync(VOLUME_LEVEL);
            await correctSound.playAsync();
        } catch (error) {
            console.error('Error playing correct sound', error);
        }
    }
}

export async function playIncorrectSound(isSoundMuted) {
    if (incorrectSound && !isSoundMuted) {
        try {
            await incorrectSound.stopAsync();
            await incorrectSound.setPositionAsync(0);
            await incorrectSound.setVolumeAsync(VOLUME_LEVEL);
            await incorrectSound.playAsync();
        } catch (error) {
            console.error('Error playing incorrect sound', error);
        }
    }
}
export async function playBGM(isMusicMuted) {
    if (bgm && !isMusicMuted) {
        try {
            await bgm.stopAsync();
            await bgm.setPositionAsync(0);
            await bgm.setVolumeAsync(VOLUME_LEVEL);
            
            bgm.setOnPlaybackStatusUpdate(async (playbackStatus) => {
                if (playbackStatus.didJustFinish) {
                    setTimeout(async () => {
                        await bgm.setPositionAsync(0);
                        await bgm.playAsync();
                    }, 500);  //500 ms delay
                }
            });

            await bgm.playAsync();
        } catch (error) {
            console.error('Error playing background music', error);
        }
    }
}


export async function stopBGM(isMusicMuted) {
    if (bgm && !isMusicMuted) {
        try {
            await bgm.stopAsync();
        } catch (error) {
            console.error('Error stopping background music', error);
        }
    }
}

export async function pauseBGM(isMusicMuted) {
    if (bgm && !isMusicMuted) {
        try {
            await bgm.pauseAsync();
        } catch (error) {
            console.error('Error pausing background music', error);
        }
    }
}


export async function unpauseBGM(isMusicMuted) {
    if (bgm && !isMusicMuted) {
        try {
            await bgm.playAsync();
        } catch (error) {
            console.error('Error unpausing background music', error);
        }
    }
}
