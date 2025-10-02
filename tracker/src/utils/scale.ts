import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BASE_WIDTH = 375;

export function scale(size: number) {
  return Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);
}

export function fontSize(size: number) {
  return Math.round(scale(size));
}