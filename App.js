import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  FlatList,
  Platform
} from "react-native";
import { BleManager } from "react-native-ble-plx";

type Props = {};

export default class App extends Component<Props> {
  constructor() {
    super()
    this.manager = new BleManager()
    this.state = {info: "", values: {}}
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
  },
});