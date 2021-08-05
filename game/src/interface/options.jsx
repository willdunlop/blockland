import React, { Component } from "react";

export default class Options extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showOptions: false,
            options: [],
        }

        this.onSubmit = this.onSubmit.bind(this)

        window.addEventListener("reveal.options", this.revealOptions.bind(this))
    }

    revealOptions(e) {
        this.setState({ showOptions: e.detail.reveal });
    }

    onSubmit(e) {
        e.preventDefault();
        this.props.core.player.socket.emit("submit options", {
          id: this.props.core.player.id,
          options: this.state.options 
        });

        this.setState({ showOptions: false });
      }

    
    onOptionSelect(option) {
        const newOptions = [ ...this.state.options ];
        const optionIndex = this.state.options.indexOf(option);
        if (optionIndex === -1) newOptions.push(option);
        else newOptions.splice(optionIndex, 1);

        this.setState({ options: newOptions })
    }

    render() {
        return (
            <div className={this.state.showOptions ? "options" : "hidden"}>
                <div className="option">
                    <input
                        type="checkbox"
                        id="onion"
                        value="onion"
                        onChange={() => this.onOptionSelect("onion")}
                        checked={this.state.options.includes("onion")}
                    />
                    <label for="onion">Onion</label>
                </div>

                <div className="option">
                    <input
                        type="checkbox"
                        id="tomato-sauce"
                        value="tomato-sauce"
                        onChange={() => this.onOptionSelect("tomato-sauce")}
                        checked={this.state.options.includes("tomato-sauce")}
                    />
                    <label for="tomato-sauce">Tomato Sauce</label>
                </div>

                <div className="option">
                    <input
                        type="checkbox"
                        id="mustard"
                        value="mustard"
                        onChange={() => this.onOptionSelect("mustard")}
                        checked={this.state.options.includes("mustard")}
                    />
                    <label for="mustard">Mustard</label>                    
                </div>

                <button
                    className="options-submit"
                    onClick={this.onSubmit}
                >Submit</button>
            </div>
        )
    }
}