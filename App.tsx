import React from 'react';
import { SafeAreaView } from 'react-native';
import CreateAd from './components/CreateAd'; 
import { NavigationContainer } from '@react-navigation/native';
import OnboardingScreen from './components/screens/OnboardingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function App() {

  const Stack = createNativeStackNavigator();

  return (
    // <SafeAreaView style={{ flex: 1 }}>
    //   <CreateAd />
    // </SafeAreaView>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={CreateAd} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}