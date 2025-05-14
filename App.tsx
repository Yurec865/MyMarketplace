import React from 'react';
import { SafeAreaView } from 'react-native';
import CreateAd from './components/CreateAd'; // або правильний шлях

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CreateAd />
    </SafeAreaView>
  );
}