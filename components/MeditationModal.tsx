import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Image, TextInput } from 'react-native';
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
      <View style={styles.container}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="black" />
        </Pressable>
        
        <Text style={styles.title}>Meditation</Text>

        <Image
          source={require('../assets/images/med.png')}
          style={styles.characterImage}
        />

        {showTimePicker ? (
          <View style={styles.timePickerContainer}>
            <TextInput
              style={styles.timeInput}
              keyboardType="number-pad"
              value={selectedMinutes}
              onChangeText={setSelectedMinutes}
              maxLength={3}
              placeholder="5"
            />
            <Text style={styles.timeInputLabel}>minutes</Text>
            <Pressable 
              style={styles.startButton}
              onPress={startMeditation}
            >
              <Text style={styles.startButtonText}>Start Meditation</Text>
            </Pressable>
            {isTimerRunning ? (null) : (null)}
          </View>
        ) : (
          <Text style={styles.timer}>{formatTime(remainingTime)}</Text>
        )}

        <View style={styles.tipsContainer}>
          <View style={styles.tipRow}>
            <Ionicons name="musical-note" size={24} color="black" />
            <Text style={styles.tipText}>Calm music can help you</Text>
          </View>

          <View style={styles.tipRow}>
            <Ionicons name="wind" size={24} color="black" />
            <Text style={styles.tipText}>Mindful breathing helps you relax</Text>
          </View>

          <View style={styles.tipRow}>
            <Ionicons name="water" size={24} color="black" />
            <Text style={styles.tipText}>Water is important</Text>
          </View>
        </View>

        {
            isTimerRunning ? (
                <Pressable 
          style={styles.finishButton}
          onPress={isTimerRunning ? stopMeditation : onClose}
        >
                <Text style={styles.finishButtonText}>
                    Stop
                </Text>
        </Pressable>
            ) : (
                null
            )
        }
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B5D99C', // Light green background
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
  },
  characterImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  tipsContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 40,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  tipText: {
    fontSize: 16,
    color: '#000',
  },
  finishButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    marginHorizontal: 20,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  timePickerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 30,
  },
  timeInput: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 120,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    padding: 10,
  },
  timeInputLabel: {
    fontSize: 20,
    color: '#000',
    marginTop: 10,
  },
  startButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});