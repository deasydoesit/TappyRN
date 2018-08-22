import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import '../../global';

const Web3 = require('web3');
const web3 = new Web3(
  new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/d389caf107ea4b5ea660d1f636ebb772')
);


export default class Account extends Component {
  constructor(props) {
    super(props)
    this.state = {
      version: "",
      web3: ""
    }
  }

  componentWillMount () {

  }

  render() {
    return (
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/tappy_brand_1x.png')} 
        />
        <Text style={styles.title}>
          Full Ethereum Wallet, Coming soon!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#343a40',
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
    color: 'white'
  }
});