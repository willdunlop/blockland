import React, {Component} from "react";

export default class Chat extends Component {
    constructor(props) {
        super(props);
        
        this.isReady = false;
        this.state = {
          value: ""
        }
        /**
        * If you only need the socket data, then change the props on main.js
        * I suspect, however, that it will be useful for the ui to have access
        * to all the core data 
        */
        this.socket = this.props.core.player.socket;
    
      }
        
      onSubmit(e) {
        e.preventDefault();
        this.props.core.player.socket.emit("chat message", {
          id: this.props.core.player.id,
          message: this.state.value 
        });
      }

    render() {
        return (
            <form className="app__form" onSubmit={e => this.onSubmit(e)}> 
            <input
              className="app_form-input"
              value={this.state.value}
              onChange={(e) => this.setState({ value: e.target.value})}
            />
          </form>    
        )
    }
}