import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TacticBoardScreen from '../screens/TacticBoardScreen';
import SavedPlaysScreen from '../screens/SavedPlaysScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0a0a1a' },
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TacticBoard" component={TacticBoardScreen} />
      <Stack.Screen name="SavedPlays" component={SavedPlaysScreen} />
    </Stack.Navigator>
  );
}
