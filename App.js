// Dependencies
import React, { Component } from "react";
import { StyleSheet, Text, SafeAreaView } from "react-native";
import { BleManager } from "react-native-ble-plx";
import './global';
import { BigNumber } from 'bignumber.js';

// Instantiate ethereumjs-tx for signing transactions
const EthereumTx = require('ethereumjs-tx');

export default class App extends Component {
  constructor() {
    super()
    this.manager = new BleManager()
    this.state = {
      info: "", 
      values: {}, 
      trans: "", 
      serialtx: "",
      txp: {}
    }
  }

  // Helper function to update this.state.info
  info(message) {
    this.setState({info: message});
  }

  // Helper function to update this.state.info in the event of an ERROR
  error(message) {
    this.setState({info: "ERROR: " + message});
  }

  componentWillMount() {

    // Power on BLE, scan and connect to peripherals, 
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
          this.scanAndConnect();
          subscription.remove();
      }
    }, true);

    // Sign tx
    const from = "0x1cc1b3553dcfA565d9FE727ED9F0483269eF3B7F";
    const privateKey = Buffer.from('', 'hex');
    const to = "0xb191d7e1ff7c4aff025d3b1bf57d0b24be74f6ba";
    const gasPrice = "0x" + new BigNumber("30000000000").toString(16);
    const gasLimit = "0x" + new BigNumber(50000).toString(16);
    const value = "0x" + new BigNumber("100000000000000000").toString(16);
    const nonce = "0x" + new BigNumber(1).toString(16);

    const txParams = {
      from,
      to,
      nonce,
      gasPrice,
      gasLimit,
      value,
      chainId: 3
    };
    this.setState({ txp: txParams });

    const tx = new EthereumTx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize().toString('hex');
    this.setState({ serialtx: serializedTx });

    const base64tx = global.btoa(serializedTx);
    this.setState({trans: base64tx});
    //---*
  }

  // Method to scan for BLE devices
  scanAndConnect() {

    // Start scanning
    this.manager.startDeviceScan(null, null, (error, device) => {
      this.info("Scanning...");
      console.log(device);

      if (error) {
        this.error(error.message);
        return
      }

      // If we find Tappy e.g., the Raspberry Pi, connect
      if (device.name === 'tappy' || device.name === 'Tappy' || device.name === 'MyDevice') {
        this.info("Connecting to Tappy");
        this.manager.stopDeviceScan(); // Stop scanning b/c we've connected to our target
        device.connect() // Connect to Tappy
          .then((device) => { // Discover services and characteristics
            this.info("Discovering services and characteristics");
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => { // After discovering services and characteristics, write tx to Tappy
            device.writeCharacteristicWithResponseForService('12ab', '34cd', this.state.trans)
              .then((characteristic) => {
                this.info(characteristic.value);
                return 
              })
          })
          .catch((error) => {
            this.error(error.message)
          })
      }
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.welcome}>Welcome to TappyRN!</Text>
        <Text style={styles.welcome}>{this.state.txp.nonce}</Text>
        <Text style={styles.welcome}>{this.state.serialtx}</Text>
        <Text style={styles.welcome}>{this.state.trans}</Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  }
});
