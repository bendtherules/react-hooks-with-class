import React, { Component } from "react";

import Form from "./Form";
import "./App.css";

export default class App extends Component {
  constructor(props) {
    super(props);
    [this.getTodos, this.setTodos] = this.useState('todos', []);
  }

  useState(key, initialValue) {
    this.state = {
      ...this.state,
      [key]: initialValue,
    };

    return ([
      // get function
      () => {
        // debugger;
        return this.state[key];
      },

      // set function
      (newValue) => {
        return this.setState({
          [key]: newValue,
        });
      }
    ]);
  }

  toggleComplete = (i) => {
    this.this.setTodos(
      this.getTodos().map(
        (todo, k) =>
          k === i
            ? {
              ...todo,
              complete: !todo.complete
            }
            : todo
      )
    );
  }

  render() {
    return (
      <div className="App" >
        <Form
          onSubmit={text => this.setTodos([{ text, complete: false }, ...this.getTodos()])}
        />
        <div>
          {this.getTodos().map(({ text, complete }, i) => (
            <div
              key={text}
              onClick={() => this.toggleComplete(i)}
              style={{
                textDecoration: complete ? "line-through" : ""
              }}
            >
              {text}
            </div>
          ))}
        </div>
        <button onClick={() => this.setTodos([])}>reset</button>
      </div>
    );
  }
}
