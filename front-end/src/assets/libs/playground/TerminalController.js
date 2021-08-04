import { FitAddon } from "xterm-addon-fit";

export default class TerminalController {
  constructor (terminal) {
    this.term = terminal;
    
    this.readBuffer = "";
    this.bufferPosition = 0;
    this._onInputEnd = () => void 0;

    this.termSize = {
      cols: 0,
      rows: 0
    };

    this.cursor = {
      col: 0,
      row: 0
    };

    this.lastReadPosition = {
      col: 0,
      row: 0
    };

    this.waitingInput = false;
    this.writing = false;

    this._initTerminal();
  }

  read (toPrint) {
    this.waitingInput = true;

    return new Promise(async resolve => {
      await this.write(toPrint);

      this.lastReadPosition.col = this.cursor.col;
      this.lastReadPosition.row = this.cursor.row;

      this.onInputEnd = resolve;
    });
  }

  write (string) {
    return new Promise(async resolve => {
      await this._waitFinishWriting();
      this.writing = true;

      string = string.replaceAll('\n', '\r\n');
      this.term.write(string, () => {
        this.cursor = {
          col: this.term.buffer.active.cursorX,
          row: this.term.buffer.active.cursorY
        };

        if (this.cursor.col >= this.termSize.cols) {
          this._moveCursorRight(true);
          this._moveCursorRight(true);
        }

        resolve();
        this.writing = false;
      });
    })
  }

  clear () {
    this.term.clear();
  }

  _initTerminal () {
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    fitAddon.fit();

    this.termSize.cols = this.term.cols;
    this.termSize.rows = this.term.rows;

    this.term.onKey((...args) => this._onKeyPress.apply(this, args));
    this.term.onResize((...args) => this._onResize.apply(this, args));
  }

  _onResize ({ rows, cols }) {
    this.termSize.cols = cols;
    this.termSize.rows = rows;
  }

  _waitFinishWriting () {
    return new Promise(resolve => {
      const checkWriting = () => {
        if (!this.writing) resolve();
        else setTimeout(() => checkWriting());
      };

      checkWriting();
    });
  }

  async _onKeyPress (key) {
    if (!this.waitingInput) return;

    await this._waitFinishWriting();

    const charCode = key.key.charCodeAt(0);

    if (key.key === "\r") {
      this.onInputEnd(this.readBuffer);
      this.readBuffer = "";
      this.bufferPosition = 0;
      this.write("\n");
      this.waitingInput = false;
    } else if (charCode === 0x1B) {
      const data = key.key.split("\x1B")[1];

      if (data === "[C") {
        if (this.bufferPosition < this.readBuffer.length) {
          this.bufferPosition++;
          this._moveCursorRight(true);
        }
      } else if (data === "[D") {
        if (this.bufferPosition > 0) {
          this.bufferPosition--;
          this._moveCursorLeft(true);
        }
      }
    } else if (charCode === 127) { // backspace
      const split = this.readBuffer.split("");
      split.splice(this.bufferPosition - 1, Math.min(this.bufferPosition, 1))
      const newBuffer = split.join("");
      this.bufferPosition--;
      if (this.bufferPosition < 0) this.bufferPosition = 0;
      await this._writeNewInput(newBuffer);
      this.readBuffer = newBuffer;
    } else if (/^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]*$/.test(key.key) || /^[a-z0-9! "#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/i.test(key.key)) { // printable character
      const split = this.readBuffer.split("");
      split.splice(this.bufferPosition, 0, key.key);
      const newBuffer = split.join("");
      this.bufferPosition++;
      await this._writeNewInput(newBuffer);
      this.readBuffer = newBuffer;
    }
  }

  _moveCursorUp () {
    this.term.write("\x1B[A");
    this.cursor.row = Math.max(0, this.cursor.row - 1);
  }

  _moveCursorDown () {
    this.term.write("\x1B[B");
    this.cursor.row = Math.min(this.termSize.rows - 1, this.cursor.row + 1);
  }

  _moveCursorRight (wrap) {
    if (wrap && this.cursor.col === this.termSize.cols - 1) {
      this._moveCursorDown();
      for (let i = 0; i < this.termSize.cols; i++) this._moveCursorLeft(false, true);
    } else {
      this.term.write("\x1B[C");
      this.cursor.col = Math.min(this.termSize.cols - 1, this.cursor.col + 1);
    }
  }

  _moveCursorLeft (wrap, ignore) {
    if (!ignore && this.cursor.col === this.lastReadPosition.col && this.cursor.row === this.lastReadPosition.row) {
      return;
    }

    if (wrap && this.cursor.col === 0) {
      this._moveCursorUp();
      for (let i = 0; i < this.termSize.cols; i++) this._moveCursorRight();
    } else {
      this.term.write("\x1B[D");
      this.cursor.col = Math.max(0, this.cursor.col - 1);
    }
  }

  _moveCursorTo (row, col) {
    const diffRow = row - this.cursor.row;
    const diffCol = col - this.cursor.col;

    if (diffRow < 0) {
      const abs = Math.abs(diffRow);
      for (let i = 0; i < abs; i++) this._moveCursorUp();
    } else {
      for (let i = 0; i < diffRow; i++) this._moveCursorDown();
    }

    if (diffCol < 0) {
      const abs = Math.abs(diffCol);
      for (let i = 0; i < abs; i++) this._moveCursorLeft();
    } else {
      for (let i = 0; i < diffCol; i++) this._moveCursorRight();
    }
  }

  async _writeNewInput (newValue) {
    const oldValue = this.readBuffer;
    const diff = oldValue.length - newValue.length;

    this._moveCursorTo(this.lastReadPosition.row, this.lastReadPosition.col);

    await this.write(newValue);

    if (diff > 0) {
      const spaces = new Array(diff).fill(" ").join("");
      await this.write(spaces);
      for (let i = 0; i < diff; i++) this._moveCursorLeft(true);
    }

    this._moveCursorTo(this.lastReadPosition.row, this.lastReadPosition.col);

    for (let i = 0; i < this.bufferPosition; i++) this._moveCursorRight(true);
  }
}
