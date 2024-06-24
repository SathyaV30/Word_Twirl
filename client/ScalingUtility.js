import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");

const BASE_WIDTH = 428;  // iPhone 13 Pro Max width in points
const BASE_HEIGHT = 926; // iPhone 13 Pro Max height in points
const scaleWidth = width / BASE_WIDTH;
const scaleHeight = height / BASE_HEIGHT;
const scale = Math.min(scaleWidth, scaleHeight);

export const scaledSize = (size) => size * scale;
