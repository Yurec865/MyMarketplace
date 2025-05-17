import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const steps = [
  {
    title: 'Create listings for OLX, Facebook and other platforms with one click',
    buttonText: 'Learn More',
    icon: 'rocket-launch',
  },
  {
    title: 'Artificial Intelligence will automatically create an attractive description and select the best photos',
    buttonText: 'Next',
    icon: 'brain',
  },
  {
    title: 'Save time on posting listings and get more sales',
    buttonText: 'Get Started',
    icon: 'chart-line',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [stepIndex, setStepIndex] = useState(0);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name={steps[stepIndex].icon} size={80} color="#4f46e5" />
        </View>
        
        <Text style={styles.title}>{steps[stepIndex].title}</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{steps[stepIndex].buttonText}</Text>
          <Icon name="arrow-right" size={20} color="#fff" style={styles.buttonIcon} />
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === stepIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
    color: '#1f2937',
    lineHeight: 32,
    fontWeight: '600',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4f46e5',
    width: 24,
  },
});