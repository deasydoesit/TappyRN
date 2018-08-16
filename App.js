// Dependencies
import React, { Component } from "react";
import { StyleSheet, Text, SafeAreaView } from "react-native";
import { BleManager } from "react-native-ble-plx";
import './global';

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
      serialtx: ""
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
    const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex');

    const txParams = {
      nonce: '0x00',
      gasPrice: '0x09184e72a000', 
      gasLimit: '0x2710',
      to: '0x0000000000000000000000000000000000000000', 
      value: '0x00', 
      data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
      chainId: 3
    }

    const tx = new EthereumTx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    this.setState({trans: serializedTx, serialtx: serializedTx});;

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
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.welcome}>{this.state.info}</Text>
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