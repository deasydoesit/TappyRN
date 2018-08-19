// Dependencies
import React, { Component } from "react";
import QrCodeCamera from "../components/QrCodeCamera.js";

export default class Pay extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null
    }
  }

  render() {
    return (
      <QrCodeCamera />
    );
  }
}

