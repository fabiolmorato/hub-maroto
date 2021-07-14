import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { XTerm } from "xterm-for-react";
import LocalEchoController from "local-echo";

import Interpreter from "../../assets/libs/acorn";

const defaultProgram = `// escreva seu código aqui :)
// para ler do usuário, utilize a função input
// para imprimir, utilize a função print, não console.log
var userInput = input("Digite alguma coisa: ");
print('Você digitou: ' + userInput);
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
          console.log('program changed', code);
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
            commands[command]();
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

      interpreter.setProperty(globalObject, 'print', interpreter.createNativeFunction(log));
      
      interpreter.setProperty(globalObject, 'input',
          interpreter.createAsyncFunction(input));

      interpreter.setProperty(globalObject, 'clearScreen', interpreter.createNativeFunction(clear));
    };

    const interpreter = new Interpreter(self.program, initFunc);
    const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));
    let steps = 0;

    async function nextStep () {
      for (;;steps++) {
        if (steps >= 10000) {
          steps = 0;
          await sleep(0);
        }
        if (!interpreter.step()) {
          break;
        }
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
    application.write(`MANUAL\n======\n\nrun: executa o programa digitado acima\n\npor enquanto só funciona com javascript ES5\n`);
  },

  run () {
    application.runProgram();
  }
};
