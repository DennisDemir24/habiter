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
  const [selectedMinutes, setSelectedMinutes] = useState('10'); // Default 10 minutes
  const [showTimePicker, setShowTimePicker] = useState(true);
  const [initialDuration, setInitialDuration] = useState(0);

  const startMeditation = () => {
    const minutes = parseInt(selectedMinutes) || 5;
    setInitialDuration(minutes * 60);
    setRemainingTime(minutes * 60);
    setIsTimerRunning(true);
    setShowTimePicker(false);
  };

  const stopMeditation = () => {
    setIsTimerRunning(false);
    setShowTimePicker(true);
    setRemainingTime(0);
    // initialDuration remains for potential restart
  };

  const restartMeditation = () => {
    setRemainingTime(initialDuration);
    setIsTimerRunning(true);
    setShowTimePicker(false);
  };

  const pauseMeditation = () => {
    setIsTimerRunning(false);
  };

  const resumeMeditation = () => {
    setIsTimerRunning(true);
  };

  const handleClose = () => {
    stopMeditation(); // Reset timer state
    onClose(); // Call the external onClose prop
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
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-[#B5D99C] p-5 flex justify-between">
        <View className="items-center">
          <Pressable className="absolute top-0 left-0 z-10" onPress={handleClose} testID="close-modal-button">
            <Ionicons name="close" size={24} color="black" />
          </Pressable>
          
          <Text className="text-2xl font-bold mt-5 mb-8">Meditation</Text>

          <Image
            source={require('../assets/images/med.png')}
            className="w-[200px] h-[200px] mb-8"
          />

          <Text className="text-base text-center my-4">
            Close your eyes, focus on your breath, and gently observe your thoughts. Allow them to come and go without judgment.
          </Text>

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

        {!showTimePicker && (
          <View className="flex-row justify-around items-center mt-6 w-full">
            {isTimerRunning ? (
              <Pressable
                className="bg-yellow-500 py-4 px-6 rounded-full items-center"
                onPress={pauseMeditation}
              >
                <Text className="text-white text-lg font-bold">Pause</Text>
              </Pressable>
            ) : (
              remainingTime > 0 && ( // Only show Resume if paused and time remains
                <Pressable
                  className="bg-green-500 py-4 px-6 rounded-full items-center"
                  onPress={resumeMeditation}
                >
                  <Text className="text-white text-lg font-bold">Resume</Text>
                </Pressable>
              )
            )}

            <Pressable
              className="bg-gray-300 py-4 px-6 rounded-full items-center"
              onPress={restartMeditation}
            >
              <Text className="text-black text-lg font-bold">Restart</Text>
            </Pressable>

            {!isTimerRunning && remainingTime > 0 && (
              <Pressable
                className="bg-red-500 py-4 px-6 rounded-full items-center"
                onPress={stopMeditation}
              >
                <Text className="text-white text-lg font-bold">Stop</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}