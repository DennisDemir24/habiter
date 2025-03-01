import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';

export const AuthLogo = ({ size = 120, primaryColor = '#6366f1', secondaryColor = '#818cf8' }) => (
    <Svg width={size} height={size} viewBox="0 0 120 120">
    {/* Background Circle */}
    <Circle cx="60" cy="60" r="56" fill="#f5f3ff" stroke={primaryColor} strokeWidth="2" />
    
    {/* Stylized H */}
    <Path 
      d="M40 35v50M40 60h40M80 35v50" 
      stroke={primaryColor} 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Habit Tracking Dots - 7 days of the week */}
    <Circle cx="40" cy="90" r="4" fill={secondaryColor} />
    <Circle cx="50" cy="90" r="4" fill={secondaryColor} />
    <Circle cx="60" cy="90" r="4" fill={secondaryColor} />
    <Circle cx="70" cy="90" r="4" fill={secondaryColor} />
    <Circle cx="80" cy="90" r="4" fill={secondaryColor} />
    
    {/* Checkmarks on completed days */}
    <Path d="M38 90l2 2 3-3" stroke="white" strokeWidth="1" strokeLinecap="round" />
    <Path d="M48 90l2 2 3-3" stroke="white" strokeWidth="1" strokeLinecap="round" />
    <Path d="M58 90l2 2 3-3" stroke="white" strokeWidth="1" strokeLinecap="round" />
    
    {/* Current day highlight */}
    <Circle cx="70" cy="90" r="6" stroke="white" strokeWidth="1" fill="none" />
  </Svg>
);

export default AuthLogo;