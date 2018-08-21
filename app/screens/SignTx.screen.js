import React, { Component } from 'react';
import {
  AsyncStorage,
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
      trans: "", 
      deviceId: "",
      value: 0,
      nonce: 11,
      qrval: 0
    }
  }

  componentWillMount() { 

    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
          this.scanAndConnect();
          subscription.remove();
      }
    }, true);

    this.retrieveData();

    const { navigation } = this.props;
    this.setState({ value: navigation.getParam('value', 'NO-VALUE') });
  }

  storeData = async () => {
    try {
      await AsyncStorage.setItem('nonce', this.state.nonce.toString());
    } catch (error) {
      console.log(error);
    }
  }

  retrieveData = async () => {
    try {
      const nonce = await AsyncStorage.getItem('nonce');
      if (nonce !== null) {
        this.setState( {nonce: nonce} );
      }
     } catch (error) {
       console.log(error);
     }
  }

  info(message) {
    this.setState({info: message});
  }

  error(message) {
    this.setState({info: "ERROR: " + message});
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
            console.log('hello device')
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            this.setState({deviceId: device.id});
            this.signTx();
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
    let qrValInWei = oneEthInWei.multipliedBy(this.state.value).toString();

    this.setState({ qrval: qrValInWei });

    const from = "0x1cc1b3553dcfA565d9FE727ED9F0483269eF3B7F";
    const privateKey = Buffer.from('4D7EF8B26D6EBFF2C0AC9CA1D4657D152578B08BB9ADEF56628D45376CC61A5A', 'hex');
    const to = "0xb191d7e1ff7c4aff025d3b1bf57d0b24be74f6ba";
    const gasPrice = "0x" + new BigNumber("30000000000").toString(16);
    const gasLimit = "0x" + new BigNumber(50000).toString(16);
    const value = "0x" + new BigNumber(qrValInWei).toString(16);
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
    this.setState({trans: base64tx});
  }

  sendTx = () => {
    this.manager.writeCharacteristicWithResponseForDevice(this.state.deviceId, '12ab', '34cd', this.state.trans)
      .then((characteristic) => {
        this.info(characteristic.value);
        this.setState({ nonce: parseInt(this.state.nonce) + 1 });
        this.storeData();
        this.manager.destroy();
        return 
      })
      .catch((error) => {
        this.error(error.message);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          info: {this.state.info}
        </Text>
        <Text style={styles.title}>
          Value: {this.state.value}
        </Text>
        <Text style={styles.title}>
          Device Id: {this.state.deviceId}
        </Text>
        <Text style={styles.title}>
          Value in Wei: {this.state.qrval}
        </Text>
        <Text style={styles.title}>
          Nonce: {this.state.nonce}
        </Text>
        <Text style={styles.title}>
          trans: {this.state.trans}
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