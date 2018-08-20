import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import '../../global.js';
const Web3 = require('web3');

export default class Account extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentWillMount () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider('https://mainnet.infura.io/')
    );
    console.log(web3.version);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Account
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
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});