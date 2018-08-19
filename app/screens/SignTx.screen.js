import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import '../../global.js'; 
import { BigNumber } from 'bignumber.js'; 
const EthereumTx = require('ethereumjs-tx');

export default class SignTx extends Component {
  constructor() {
    super()
    this.manager = new BleManager()
    this.state = {
      info: "", 
      values: {}, 
      trans: "", 
      serialtx: "",
      txp: {},
      deviceId: ""
    }
  }

  componentWillMount() { 
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
          this.scanAndConnect();
          subscription.remove();
      }
    }, true);
  }

  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
      this.info("Scanning...");

      if (error) {
        this.error(error.message);
        return
      }

      if (device.name === 'tappy' || device.name === 'Tappy' || device.name === 'MyDevice') {
        this.info("Connecting to Tappy");
        this.manager.stopDeviceScan(); 
        device.connect()
          .then((device) => {
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            this.setState({deviceId: device.id});
          })
          .catch((error) => {
            this.error(error.message);
          })
        return
      }
    });
  }

  sendTx = () => {
    this.manager.writeCharacteristicWithResponseForDevice(this.state.deviceId, '12ab', '34cd', 'aGVsbG8gdGFwcHk=')
      .then((characteristic) => {
        this.info(characteristic.value);
        return 
      })
      .catch((error) => {
        this.error(error.message);
      });
  }

  info(message) {
    this.setState({info: message});
  }

  // Helper function to update this.state.info in the event of an ERROR
  error(message) {
    this.setState({info: "ERROR: " + message});
  }

  render() {
    const { navigation } = this.props;
    const value = navigation.getParam('value', 'NO-VALUE');

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          VALUE: {value}
        </Text>
        <Text style={styles.title}>
          Device Id: {this.state.deviceId}
        </Text>
        <Button
          title="Pay"
          onPress={this.sendTx}
        />
        <Button
          title="Back To Pay"
          onPress={() => this.props.navigation.navigate('Tabs')}
        />
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