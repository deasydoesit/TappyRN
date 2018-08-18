// Dependencies
import React, { Component } from "react";
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  SafeAreaView
} from "react-native";
import { BleManager } from "react-native-ble-plx"; // BLE dependency
import QRCodeScanner from 'react-native-qrcode-scanner'; // QR Code Scanner dependency
import './global'; // Injects node globals into React Native global scope
import { BigNumber } from 'bignumber.js'; // Required for Ethereum 
const EthereumTx = require('ethereumjs-tx'); // Instantiate ethereumjs-tx for signing transactions

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

  onSuccess(e) {
    this.info(e.data);
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
    const privateKey = Buffer.from('4D7EF8B26D6EBFF2C0AC9CA1D4657D152578B08BB9ADEF56628D45376CC61A5A', 'hex');
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

  // render() {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <Text style={styles.welcome}>Welcome to TappyRN!</Text>
  //       <Text style={styles.welcome}>{this.state.txp.nonce}</Text>
  //       <Text style={styles.welcome}>{this.state.serialtx}</Text>
  //       <Text style={styles.welcome}>{this.state.trans}</Text>
  //     </SafeAreaView>
  //   );
  // }
  render() {
    return (
      <QRCodeScanner
        onRead={this.onSuccess.bind(this)}
        topContent={
          <Text style={styles.centerText}>
            Go to <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on your computer and scan the QR code.
          </Text>
        }
        bottomContent={
          <Text style={styles.centerText}>
            Value: <Text style={styles.textBold}>{this.state.info}</Text>
          </Text>
        }
      />
    );
  }
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1
//   },
//   welcome: {
//     fontSize: 20,
//     textAlign: 'center',
//     margin: 10,
//   },
//   instructions: {
//     textAlign: 'center',
//     color: '#333333',
//     marginBottom: 5,
//   }
// });

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});

AppRegistry.registerComponent('default', () => ScanScreen);
