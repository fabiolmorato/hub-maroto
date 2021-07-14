import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { XTerm } from "xterm-for-react";
import LocalEchoController from "local-echo";

import Interpreter from "../../assets/libs/acorn";

const defaultProgram = `// escreva seu código aqui :)
// para ler do usuário, utilize a função input
// para imprimir, utilize a função print, não console.log
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
  program: "",

  setLocalEcho (localEcho) {
    this.localEcho = localEcho;
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
            this.write(`"${command}" is not a recognized command! Type help for help.`);
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

      interpreter.setProperty(globalObject, 'print', interpreter.createNativeFunction(log));
      
      interpreter.setProperty(globalObject, 'input',
          interpreter.createAsyncFunction(input));
    };

    const interpreter = new Interpreter(self.program, initFunc);

    function nextStep () {
      if (interpreter.step()) {
        setTimeout(nextStep, 0);
      } else {
        self.running = false;
        setTimeout(() => self.start(), 0);
      }
    }

    setTimeout(() => nextStep(), 0);
  },

  write (string) {
    const lines = string.split('\n');
    for (const line of lines) {
      this.term.writeln(line);
    }
  }
};

const commands = {
  help () {
    application.write(`run: executa o programa digitado acima`);
  },

  run () {
    application.runProgram();
    // application.write(`${application.program}`);
  }
};
