import React, { Component } from "react";

import "./App.css";

export default class App extends Component {
  constructor(props) {
    super(props);
    this._internal = {
      effects: [], // array of {asyncFn, dependencyArrayFnOptional, oldDependencyArray, unregisterFn}
    };

    ([this.getCount, this.setCount] = this.useState('count', 0));

    ({ getData: this.getData, getLoading: this.getLoading } = this.useFetch("https://api.randomuser.me/"));
  }

  useState(key, initialValue) {
    this.state = {
      ...this.state,
      [key]: initialValue,
    };

    return ([
      // get function
      () => {
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

  useEffect(asyncFn, dependencyArrayFnOptional = undefined) {
    this._internal.effects.push({
      asyncFn,
      dependencyArrayFnOptional,
      oldDependencyArray: undefined,
      unregisterFn: undefined,
    })
  }

  componentDidMount() {
    this._internal.effects.forEach((eachEffect) => {
      const {
        asyncFn,
        dependencyArrayFnOptional,
        // oldDependencyArray,
        // unregisterFn,
      } = eachEffect;


      let newDependencyArray = undefined;
      if (dependencyArrayFnOptional && dependencyArrayFnOptional.call) {
        newDependencyArray = dependencyArrayFnOptional.call(this);
      }

      eachEffect.oldDependencyArray = newDependencyArray;

      Promise.resolve(asyncFn.call(this))
        .then((newUnregisterFn) => {
          eachEffect.unregisterFn = newUnregisterFn;
        });
    });
  }

  static didDependencyArrayUpdate(oldDependencyArray, newDependencyArray) {
    if (
      (!Array.isArray(oldDependencyArray) || !Array.isArray(newDependencyArray)) ||
      (oldDependencyArray.length !== newDependencyArray.length)
    ) {
      return true;
    } else {
      return oldDependencyArray.some((_, index) => oldDependencyArray[index] !== newDependencyArray[index])
    }
  }

  componentDidUpdate() {
    this._internal.effects.forEach((eachEffect) => {
      const {
        asyncFn,
        dependencyArrayFnOptional,
        oldDependencyArray,
        unregisterFn,
      } = eachEffect;

      let newDependencyArray = undefined;
      if (dependencyArrayFnOptional && dependencyArrayFnOptional.call) {
        newDependencyArray = dependencyArrayFnOptional.call(this);
      }

      if (App.didDependencyArrayUpdate(oldDependencyArray, newDependencyArray)) {
        eachEffect.oldDependencyArray = newDependencyArray;

        if (unregisterFn && unregisterFn.call) {
          unregisterFn.call(this);
        }

        Promise.resolve(asyncFn.call(this))
          .then((newUnregisterFn) => {
            eachEffect.unregisterFn = newUnregisterFn;
          });
      }
    });
  }

  componentWillUnmount() {
    this._internal.effects.forEach((eachEffect) => {
      const {
        unregisterFn,
      } = eachEffect;

      if (unregisterFn && unregisterFn.call) {
        unregisterFn.call(this);
      }

    });

    delete this._internal.effects;
  }

  useFetch(url) {
    const [getData, setData] = this.useState("data", null);
    const [getLoading, setLoading] = this.useState("loading", true);

    // Similar to componentDidMount and componentDidUpdate:
    this.useEffect(async () => {
      const response = await fetch(url);
      const data = await response.json();
      const [item] = data.results;
      // TODO: If possible, batch these two updates
      setData(item);
      setLoading(false);
    }, () => ([this.getCount()]));

    return { getData, getLoading };
  }

  render() {
    const count = this.getCount();
    const data = this.getData();
    const loading = this.getLoading();

    return (
      <div>
        <p>You clicked {count} times</p>
        <button onClick={() => this.setCount(count + 1)}>Click me</button>
        {loading ? <div>...loading</div> : <div>{data.name.first}</div>}
      </div>
    );
  }
}
