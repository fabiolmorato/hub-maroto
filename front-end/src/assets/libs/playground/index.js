import * as Babel from "@babel/standalone";
import { FitAddon } from "xterm-addon-fit";

import Interpreter from "../acorn";

export default class Playground {
  constructor (terminal) {
    this.term = terminal;
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    fitAddon.fit();

    this.running = false;
    this.program = defaultProgram;
    this.instructionBlockSize = 10000;
    this.instructionBlockSleep = 0;
    this.echoReturn = true;

    this.readBuffer = "";
    this.term.onKey(key => {
      if (key.key.charCodeAt(0) === 127) {
        this.readBuffer = this.readBuffer.split("").slice(0, this.readBuffer.length - 1).join("");
        this.term.write("\x1B[D");
        this.term.write(" ");
        this.term.write("\x1B[D");
      } else if (key.key !== '\r') {
        this.term.write(key.key);
        this.readBuffer += key.key;
      } else {
        this.term.write(key.key);
        this.onInputEnd(this.readBuffer);
        this.readBuffer = "";
        this.term.write("\n");
      }
    });
    this.onInputEnd = () => void 0;

    this.commands = {
      help: {
        execute () {
          const commands = Object.keys(this.commands);
          const descriptions = commands.map(c => `${c}: ${this.commands[c].description}\n`).join('\n')

          this.write(`MANUAL\n======\n\n${descriptions}`);
        },

        description: "mostra esse dialógo"
      },

      run: {
        execute () {
          this.runProgram();
        },

        description: "executa o programa digitado acima"
      }
    };
  }

  start () {
    this.running = false;
    this.readCommand();
  }

  read (toPrint) {
    return new Promise(resolve => {
      this.term.write(toPrint);
      this.onInputEnd = resolve;
    });
  }

  readCommand () {
    if (!this.running) {
      this.read("\x1B[1m\x1B[38;2;0;255;0muser@playground\x1B[0m\x1B[1m$ \x1B[0m").then(input => {
        const parts = input.split(' ').filter(p => p.length > 0);
        const command = parts[0];

        if (command) {
          if (this.commands[command]) {
            this.commands[command].execute.apply(this, parts.slice(1));
          } else {
            this.write(`"${command}" não é um comando reconhecido! Digite help para obter ajuda.\n`);
          }
        }

        this.readCommand();
      });
    }
  }

  readInput (string, callback) {
    if (this.running) {
      this.read(string || "> ").then(input => {
        callback(input);
      });
    }
  }

  setProgram (program) {
    this.program = program;
  }

  runProgram () {
    this.running = true;

    this.term.clear();
    const self = this;

    function initFunc (interpreter, globalObject) {      
      function input (string, callback) {
        self.readInput(string, callback);
      }

      function log (...args) {
        console.log(...args);
        self.write(args.join(' '));
      }

      function clear () {
        self.term.clear();
      }

      const consoleObj = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'console', consoleObj);
      interpreter.setProperty(consoleObj, 'log', interpreter.createNativeFunction(log));
      
      interpreter.setProperty(globalObject, 'input', interpreter.createAsyncFunction(input));

      interpreter.setProperty(globalObject, 'clearScreen', interpreter.createNativeFunction(clear));
    };

    function endProgram (error, value) {
      if (error) {
        self.term.write('\x1B[1m\x1B[38;2;255;0;0mError: \x1B[0m' + error.message);
      }

      self.running = false;
      self.write('\n');
      
      if (value && self.echoReturn && value !== 'use strict') {
        self.write(`-> ${interpreter.value}\n`);
      }
      
      self.readCommand();
    }

    const transpiled = Babel.transform(self.program, { presets: ["env"] }).code;

    const interpreter = new Interpreter(transpiled, initFunc);
    const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));
    let steps = 0;

    async function nextStep () {
      try {
        for (;;steps++) {
          if (steps >= self.instructionBlockSize) {
            steps = 0;
            await sleep(self.instructionBlockSleep);
          }
          if (!interpreter.step()) {
            break;
          }
        }
  
        endProgram(null, interpreter.value);
      } catch (err) {
        console.error(err);
        endProgram(err, null);
      }
    }

    setTimeout(() => nextStep(), 0);
  }

  write (string) {
    string = string.replaceAll('\n', '\r\n');
    this.term.write(string);
  }
}

const defaultProgram = `// escreva seu código aqui :)
`;
