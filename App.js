import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  FlatList,
  Platform
} from "react-native";
import { BleManager } from "react-native-ble-plx";
import './global';
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');

export default class App extends Component {
  constructor() {
    super()
    this.manager = new BleManager()
    this.state = {info: "", values: {}, web3: "", trans: ""}
    this.text = ""
  }

  info(message) {
    this.setState({info: message});
  }

  error(message) {
    this.setState({info: "ERROR: " + message});
  }

  componentWillMount() {
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
          this.scanAndConnect();
          subscription.remove();
      }
    }, true);

    const web3 = new Web3(
      new Web3.providers.HttpProvider('https://mainnet.infura.io/')
    );
    this.setState({web3: web3.version});

    const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')

    const txParams = {
      nonce: '0x00',
      gasPrice: '0x09184e72a000', 
      gasLimit: '0x2710',
      to: '0x0000000000000000000000000000000000000000', 
      value: '0x00', 
      data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
      // EIP 155 chainId - mainnet: 1, ropsten: 3
      chainId: 3
    }

    const tx = new EthereumTx(txParams)
    tx.sign(privateKey)
    const serializedTx = tx.serialize()
    this.setState({trans: serializedTx});

  }

  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
      this.info("Scanning...");
      console.log(device);

      if (error) {
        this.error(error.message);
        return
      }

      if (device.name === 'tappy' || device.name === 'Tappy' || device.name === 'MyDevice') {
        this.info("Connecting to Tappy");
        this.manager.stopDeviceScan();
        device.connect()
          .then((device) => {
            this.info("Discovering services and characteristics");
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            this.info(device.id);
            device.writeCharacteristicWithResponseForService('12ab', '34cd', 'aGVsbG8gbWlzcyB0YXBweQ==')
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
        <Text style={styles.welcome}>{this.state.web3}</Text>
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