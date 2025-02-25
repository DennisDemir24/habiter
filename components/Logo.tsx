import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export const LogoIcon = ({ size = 120, color = '#6366f1' }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Circle cx="60" cy="60" r="50" fill={color} opacity={0.1} />
    <Circle cx="60" cy="60" r="40" fill={color} opacity={0.2} />
    <Path
      d="M40 60a20 20 0 0 1 40 0v20a20 20 0 0 1-40 0V60z"
      fill={color}
    />
    <Circle cx="60" cy="45" r="15" fill={color} />
  </Svg>
);