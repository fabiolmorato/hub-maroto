import * as Babel from "@babel/standalone";

import Interpreter from "../acorn";

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

export default class Runner {
  constructor (program) {
    this.program = program;
    this.injectables = [];
  }

  inject (codeValue) {
    this.injectables.push(codeValue);
  }

  _injectableValue (interpreter, value, currentObject) {
    if (value.type === "object") {
      const object = interpreter.nativeToPseudo({});

      for (const property of value.value) {
        this._injectableValue(interpreter, property, object);
      }

      interpreter.setProperty(currentObject, value.name, object);
    } else if (value.type === "function") {
      const fn = interpreter.createNativeFunction(value.value);
      interpreter.setProperty(currentObject, value.name, fn);
    } else if (value.type === "asyncFunction") {
      const fn = interpreter.createAsyncFunction(value.value);
      interpreter.setProperty(currentObject, value.name, fn);
    } else {
      interpreter.setProperty(currentObject, value.name, value.value);
    }
  }

  run () {
    return new Promise(async (resolve) => {
      const initFunc = (interpreter, globalObject) => {
        for (const injectable of this.injectables) {
          this._injectableValue(interpreter, injectable, globalObject);
        }
      };

      const transpiled = Babel.transform(this.program, { presets: ["env"] }).code;
      const interpreter = new Interpreter(transpiled, initFunc);

      let steps = 0;

      for (;;steps++) {
        if (steps >= 10000) {
          steps = 0;
          await sleep(0);
        }
        if (!interpreter.step()) {
          break;
        }
      }

      resolve(interpreter.value);
    });
  }
}
