import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { XTerm } from "xterm-for-react";
import LocalEchoController from "local-echo";
import * as Babel from "@babel/standalone";

import Interpreter from "../../assets/libs/acorn";

const defaultProgram = `// escreva seu código aqui :)
`;

export default function Playground () {
  const xtermRef = useRef(null);

  useEffect(() => {
    const terminal = xtermRef.current.terminal;
    const localEcho = new LocalEchoController();
    terminal.loadAddon(localEcho);

    application.setTerm(terminal);
    application.setLocalEcho(localEcho);

    application.start();
  }, []);

  return (
    <>
      <Editor 
        height="calc(100vh - 432px)"
        defaultLanguage="javascript"
        defaultValue={defaultProgram}
        theme="vs-dark"
        onChange={code => {
          // console.log('program changed', code);
          application.setProgram.apply(application, [code]);
        }}
      />
      <XTerm ref={xtermRef} options={{ cursorBlink: true }} />
    </>
  );
}

const application = {
  running: false,
  localEcho: null,
  term: null,
  program: defaultProgram,
  instructionBlockSize: 10000,
  instructionBlockSleep: 0,
  echoReturn: true,

  setLocalEcho (localEcho) {
    this.localEcho = localEcho;
    commands.help();
  },

  setTerm (term) {
    this.term = term;
  },

  start () {
    this.running = false;
    this.localEcho.abortRead();
    // this.term.clear();
    this.readCommand();
  },

  readCommand () {
    if (!this.running) {
      this.localEcho.read("$ ").then(input => {
        const parts = input.split(' ').filter(p => p.length > 0);
        const command = parts[0];

        if (command) {
          if (commands[command]) {
            commands[command](...parts.slice(1));
          } else {
            this.write(`"${command}" não é um comando reconhecido! Digite help para obter ajuda.`);
          }
        }

        this.readCommand();
      });
    }
  },

  readInput (string, callback) {
    if (this.running) {
      this.localEcho.read(string || "> ").then(input => {
        callback(input);
      });
    }
  },

  setProgram (program) {
    this.program = program;
  },

  runProgram () {
    this.running = true;

    this.localEcho.abortRead();
    this.term.clear();
    const self = this;

    function initFunc (interpreter, globalObject) {
      var wrapper = function alert(text) {
        return window.alert(text);
      };

      interpreter.setProperty(globalObject, 'alert',
          interpreter.createNativeFunction(wrapper));
      
      function input (string, callback) {
        self.readInput(string, callback);
      }

      function log (...args) {
        console.log(...args);
        self.write(args.join('\n'));
      }

      function clear () {
        self.term.clear();
      }

      const consoleObj = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'console', consoleObj);

      interpreter.setProperty(consoleObj, 'log', interpreter.createNativeFunction(log));
      
      interpreter.setProperty(globalObject, 'input',
          interpreter.createAsyncFunction(input));

      interpreter.setProperty(globalObject, 'clearScreen', interpreter.createNativeFunction(clear));
    };

    const transpiled = Babel.transform(self.program, { presets: ["env"] }).code;
    console.log(transpiled);

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
  
        self.running = false;
        self.write('\n');
        self.write(`-> ${interpreter.value}\n`);
        self.readCommand();
      } catch (err) {
        console.error(err);
        self.term.write(err.message);
        self.running = false;
        self.write('\n');
        self.readCommand();
      }
    }

    setTimeout(() => nextStep(), 0);
  },

  write (string) {
    string = string.replaceAll('\n', '\r\n');
    this.term.write(string);
  },
};

const commands = {
  help () {
    application.write(`MANUAL\n======\n\nrun: executa o programa digitado acima\nhelp: mostra esse diálogo\nset <CONFIG=value>: configura flag do interpretador\n\n`);
  },

  run () {
    application.runProgram();
  },

  set (setting) {
    const parts = setting.split('=');
    const name = parts[0];
    const value = parts[1];

    if (name === 'SPEED') {
      if (value === 'slower') {
        application.instructionBlockSize = 5;
        application.instructionBlockSleep = 100;
      } else if (value === 'slow') {
        application.instructionBlockSize = 50;
        application.instructionBlockSleep = 10;
      } else if (value === 'medium') {
        application.instructionBlockSize = 500;
        application.instructionBlockSleep = 1;
      } else if (value === 'fast') {
        application.instructionBlockSize = 1000;
        application.instructionBlockSleep = 1;
      } else if (value === 'faster') {
        application.instructionBlockSize = 10000;
        application.instructionBlockSleep = 0;
      } else {
        application.write(`Valor desconhecido para parâmetro SPEED. Ignorando.\n`);
      }
    } else if (name === 'ECHO_RETURN') {
      application.echoReturn = value === 'true'; 
    } else {
      application.write(`Configuração inválida.\n`);
    }
  }
};
