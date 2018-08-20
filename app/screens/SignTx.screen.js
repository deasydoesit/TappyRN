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
  constructor(props) {
    super(props)
    this.manager = new BleManager()
    this.state = {
      info: "", 
      values: {}, 
      trans: "", 
      serialtx: "",
      txp: {},
      deviceId: "",
      value: navigation.getParam('value', 'NO-VALUE'),
      nonce: 2
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

  signTx = () => {
    let oneEthInWei = new BigNumber("1000000000000000000");
    let qrval = oneEthInWei.multipliedBy(this.state.val);

    const from = "0x1cc1b3553dcfA565d9FE727ED9F0483269eF3B7F";
    const privateKey = Buffer.from('4D7EF8B26D6EBFF2C0AC9CA1D4657D152578B08BB9ADEF56628D45376CC61A5A', 'hex');
    const to = "0xb191d7e1ff7c4aff025d3b1bf57d0b24be74f6ba";
    const gasPrice = "0x" + new BigNumber("30000000000").toString(16);
    const gasLimit = "0x" + new BigNumber("50000").toString(16); //changed 50000 from num to string
    const value = "0x" + qrval.toString(16);
    const nonce = "0x" + new BigNumber(this.state.nonce).toString(16);

    const txParams = {
      from,
      to,
      nonce,
      gasPrice,
      gasLimit,
      value,
      chainId: 3
    };

    const tx = new EthereumTx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize().toString('hex');

    const base64tx = global.btoa(serializedTx);
    this.setState({trans: base64tx, nonce: this.state.nonce + 1});
  }

  sendTx = () => {
    this.signTx();
    this.manager.writeCharacteristicWithResponseForDevice(this.state.deviceId, '12ab', '34cd', this.state.trans)
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