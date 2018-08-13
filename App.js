import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  SafeAreaView,
  FlatList,
  Platform,
  Button, 
  View
} from "react-native";
import { BleManager, Device, BleError, LogLevel } from "react-native-ble-plx";

type Props = {};
export default class App extends Component<Props> {
  constructor() {
    super()
    this.manager = new BleManager()
    this.state = {info: "", values: {}}
  }

  info(message) {
    this.setState({info: message})
  }

  error(message) {
    this.setState({info: "ERROR: " + message})
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') this.scanAndConnect()
      })
    } else {
      this.scanAndConnect()
    }
  }

  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
      this.info("Scanning...")
      console.log(device)

      if (error) {
        this.error(error.message)
        return
      }

      if (device.name === 'tappy' || device.name === 'Tappy') {
        this.info("Connecting to TI Sensor")
        this.manager.stopDeviceScan()
        device.connect()
          .then((device) => {
            this.info("Discovering services and characteristics")
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            this.info("Setting notifications")
            return this.setupNotifications(device)
          })
          .then(() => {
            this.info("Listening...")
          }, (error) => {
            this.error(error.message)
          })
      }
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <FlatList
          style={styles.container}
          data={this.state.text}
          renderItem={({ item }) => <Text> {item} </Text>}
          keyExtractor={(item, index) => index.toString()}
        />
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