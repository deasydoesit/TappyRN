import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  Button,
  Linking
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
      serialize: "",
      trans: "", 
      deviceId: "",
      value: 0,
      nonce: 15,
      qrval: 0,
      txHashUrl: ""
    }
  }

  componentWillMount() { 
    const { navigation } = this.props;
    this.setState({ value: navigation.getParam('value', 'NO-VALUE') });

    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
          this.scanAndConnect();
          subscription.remove();
      }
    }, true);

    this.retrieveData();
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
        return;
      }

      if (device.name === 'tappy' || device.name === 'Tappy' || device.name === 'MyDevice') {
        this.info("Connecting to Tappy");
        this.manager.stopDeviceScan(); 
        device.connect()
          .then((device) => {
            return device.discoverAllServicesAndCharacteristics();
          })
          .then((device) => {
            this.setState({deviceId: device.id});
            this.signTx();
          })
          .catch((error) => {
            this.error(error.message);
          })
        return;
      }
    });
  }

  destroyAndGoBack = () => {
    this.manager.destroy();
    this.props.navigation.navigate('Tabs');
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
    this.setState({trans: base64tx, serialize: serializedTx});
  }

  sendTx = () => {
    this.manager.writeCharacteristicWithResponseForDevice(this.state.deviceId, '12ab', '34cd', this.state.trans)
      .then((characteristic) => {
        console.log(characteristic.value);
        this.setState({ nonce: parseInt(this.state.nonce) + 1 });
        this.storeData();
        setTimeout(() => {
          this.readTxHash();
          return;
        }, 2000);
      })
      .catch((error) => {
        this.error(error.message);
      });
  }

  readTxHash = () => {
    this.manager.readCharacteristicForDevice(this.state.deviceId, '12ab', '34cd') 
      .then((characteristic) => {
        console.log(characteristic.value);
        this.setState({ info: characteristic.value });
        let res = Buffer.from(characteristic.value, 'base64').toString('ascii');
        this.manager.destroy();
        Linking.openURL(res).catch(err => console.error('An error occurred', err));
        return;
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
          Serialize: {this.state.serialize}
        </Text>
        <Button
          title="Pay"
          onPress={this.sendTx}
        />
        <Button
          title="Back To Pay"
          onPress={this.destroyAndGoBack}
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