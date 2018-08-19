import React, { Component } from 'react';
import { Dimensions, Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

import Account from './screens/Account.screen.js';
import Pay from './screens/Pay.screen.js';
import SignTx from './screens/SignTx.screen.js';

let screen = Dimensions.get('window');

export const Tabs = createBottomTabNavigator({
  'Account': {
    screen: Account,
    navigationOptions: {
      tabBarLabel: 'Account',
      tabBarIcon: ({ tintColor }) => <Icon name="account-balance" type="MaterialCommunityIcons" size={28} color={tintColor} />
    },
  },
  'Pay': {
    screen: Pay,
    navigationOptions: {
      tabBarLabel: 'Pay',
      tabBarIcon: ({ tintColor }) => <Icon name="ios-cash" type="ionicon" size={28} color={tintColor} />
    },
  }
});

export const payStack = createStackNavigator({
    Pay: {
      screen: Pay,
      navigationOptions: ({navigation}) => ({
        header: null,
      }),
    },
    SignTx: {
      screen: SignTx,
      navigationOptions: ({navigation}) => ({
        header: null,
        tabBarVisible: false,
        gesturesEnabled: false
      }),
    },
});
  
export const createRootNavigator = () => {
  return createStackNavigator(
    {
      Tabs: {
        screen: Tabs,
        navigationOptions: {
          gesturesEnabled: false
        }
      },
      payStack: {
        screen: payStack,
        navigationOptions: {
          gesturesEnabled: false
        }
      },
    },
    {
      headerMode: "none",
      mode: "modal"
    }
  );
};