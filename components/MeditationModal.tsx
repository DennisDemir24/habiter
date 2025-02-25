import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MeditationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MeditationModal({ isVisible, onClose }: MeditationModalProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState('5'); // Default 5 minutes
  const [showTimePicker, setShowTimePicker] = useState(true);

  const startMeditation = () => {
    const minutes = parseInt(selectedMinutes) || 5;
    setRemainingTime(minutes * 60);
    setIsTimerRunning(true);
    setShowTimePicker(false);
  };

  const stopMeditation = () => {
    setIsTimerRunning(false);
    setShowTimePicker(true);
    setRemainingTime(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setShowTimePicker(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}min ${seconds}s`;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#B5D99C] p-5 flex justify-between">
        <View className="items-center">
          <Pressable className="absolute top-0 left-0 z-10" onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </Pressable>
          
          <Text className="text-2xl font-bold mt-5 mb-8">Meditation</Text>

          <Image
            source={require('../assets/images/med.png')}
            className="w-[200px] h-[200px] mb-8"
          />

          {showTimePicker ? (
            <View className="flex-col items-center mb-8">
              <TextInput
                className="text-5xl font-bold text-center w-[120px] border-b-2 border-black/20 p-2.5"
                keyboardType="number-pad"
                value={selectedMinutes}
                onChangeText={setSelectedMinutes}
                maxLength={3}
                placeholder="5"
              />
              <Text className="text-xl text-black mt-2.5">minutes</Text>
              <Pressable 
                className="bg-green-500 py-4 px-8 rounded-full mt-5"
                onPress={startMeditation}
              >
                <Text className="text-white text-lg font-bold">Start Meditation</Text>
              </Pressable>
            </View>
          ) : (
            <Text className="text-4xl font-bold mb-10">{formatTime(remainingTime)}</Text>
          )}

          <View className="w-full gap-4">
            <View className="flex-row items-center bg-white/30 p-4 rounded-xl gap-2.5">
              <Ionicons name="musical-note" size={24} color="black" />
              <Text className="text-base text-black">Calm music can help you</Text>
            </View>

            <View className="flex-row items-center bg-white/30 p-4 rounded-xl gap-2.5">
              <Ionicons name="headset" size={24} color="black" />
              <Text className="text-base text-black">Mindful breathing helps you relax</Text>
            </View>
          </View>
        </View>

        {isTimerRunning && (
          <View className="items-center mt-6">
            <Pressable 
              className="bg-white py-4 px-8 rounded-full w-[90%] items-center"
              onPress={stopMeditation}
            >
              <Text className="text-lg font-bold text-black">Stop</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}