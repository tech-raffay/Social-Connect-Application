import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import Loader from '../components/Loader';
import { COLORS } from '../constants/theme';

export const RootNavigator = () => {
  const { user, authLoading } = useAppContext();

  if (authLoading) {
    return <Loader visible={authLoading} message="Starting Social Connect..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="light-content"
        translucent={false}
      />
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
