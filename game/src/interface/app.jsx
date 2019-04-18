import React, { Component } from 'react';
import constants from '../config/constants';


class App extends Component {
  constructor(props) {
    super(props);

    console.log("props.core", props.core);

    this.isReady = false;
    /**
    * If you only need the socket data, then change the props on main.js
    * I suspect, however, that it will be useful for the ui to have access
    * to all the core data 
    */
    this.socket = this.props.core.player.socket;

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    console.log("clicked that shit")

    if(!this.isReady) {
      this.isReady = true;
      this.socket.emit('ready', {
        isReady: true
      })
    }
  }


  render() {
    return (
      <button
        className="app__isReady"
        onClick={this.onClick}
        >
          Ready!
        </button>
    )
  }
}

export default App;
