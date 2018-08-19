import React, { Component } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { withNavigationFocus } from "react-navigation";
import QRCodeScanner from 'react-native-qrcode-scanner'; 

class QrCodeCamera extends Component {

    onSuccess = (e) => {
        let value = e.data;
        this.props.navigation.navigate('SignTx', {value: value})
    }

    renderCamera = () => {
       const isFocused = this.props.navigation.isFocused();
       
       if (!isFocused) {
           return null;
       } else if (isFocused) {
           return (
                <QRCodeScanner 
                onRead={this.onSuccess.bind(this)}
                fadeIn={false}
                cameraStyle={styles.cameraContainer}
                topViewStyle={styles.zeroContainer}
                bottomViewStyle={styles.zeroContainer}
                />
           )
       }
    }

    render = () => {
       return (
         <View style={{ flex: 1 }}>
            {this.renderCamera()}
         </View>
       );
   }
}

const styles = StyleSheet.create({
    zeroContainer: {
      height: 0,
      flex: 0,
    },
  
    cameraContainer: {
      height: Dimensions.get('window').height,
    },
});

export default withNavigationFocus(QrCodeCamera);