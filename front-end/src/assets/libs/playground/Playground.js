import TerminalController from "./TerminalController";
import Runner from "./Runner";

export default class Playground {
  constructor (terminal) {
    this.term = new TerminalController(terminal);
    this.program = defaultProgram;

    this.injectables = ([
      {
        type: "object",
        name: "console",
        value: [
          {
            type: "function",
            name: "log",
            value: (...args) => {
              const string = args.join(" ") + "\r\n";
              this.term.write(string.replaceAll("\n", "\r\n"));
            }
          },
          {
            type: "function",
            name: "clear",
            value: () => {
              this.term.clear();
            }
          }
        ]
      },
      {
        type: "asyncFunction",
        name: "input",
        value: (string, callback) => {
          this.term.read(string || "> ").then(callback);
        }
      },
      {
        type: "function",
        name: "print",
        value: (...args) => {
          const string = args.join(" ");
          this.term.write(string.replaceAll("\n", "\r\n"));
        }
      }
    ]);

    this.commands = {
      help: {
        execute () {
          const commands = Object.keys(this.commands);
          const descriptions = commands.map(c => `${c}: ${this.commands[c].description}`).join('\n')

          this.term.write(`MANUAL\n======\n\n${descriptions}\n`);
        },

        description: "mostra esse dialógo"
      },

      run: {
        description: "executa o programa digitado acima",
        async execute () {
          this.term.clear();

          const runner = new Runner(this.program);
          for (const injectable of this.injectables) runner.inject(injectable);

          try {
            const value = await runner.run();
            if (value !== undefined) {
              this.term.write(`\n-> ${value}\n`);
            }
          } catch (err) {
            console.error(err);
            this.term.write('\x1B[1m\x1B[38;2;255;0;0mError: \x1B[0m' + err.message + '\n');
          }
        }
      }
    }
  }

  start () {
    this.readCommand();
  }

  readCommand () {
    this.term.read("\x1B[1m\x1B[38;2;0;255;0muser@playground\x1B[0m\x1B[1m$ \x1B[0m").then(async input => {
      const parts = input.split(' ').filter(p => p.length > 0);
      const command = parts[0];

      if (command) {
        if (this.commands[command]) {
          await this.commands[command].execute.apply(this, parts.slice(1));
        } else {
          this.term.write(`"${command}" não é um comando reconhecido! Digite help para obter ajuda.\n`);
        }
      }

      this.readCommand();
    });
  }

  setProgram (program) {
    this.program = program;
  }

  getProgram () {
    return this.program;
  }
}

const defaultProgram = `// escreva seu código aqui :)
// utilize a função input() para ler dados do usuário

const num1 = +input("Digite o primeiro valor: ");
const num2 = +input("Digite o segundo valor: ");
console.log(\`\${num1} + \${num2} = \${num1 + num2}\`);
`;

