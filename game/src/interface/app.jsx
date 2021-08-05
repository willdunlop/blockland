import React, { Component } from 'react';

import Chat from './chat';
import Options from './options';


class App extends Component {
  constructor(props) {
    super(props);

  }


  render() {
    return (
      <div>
        <Options core={this.props.core} />
        <Chat core={this.props.core} />
      </div>
    )
  }
}

export default App;
