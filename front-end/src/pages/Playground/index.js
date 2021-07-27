import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { XTerm } from "xterm-for-react";

import PlaygroundRunner from "../../assets/libs/playground";

export default function Playground () {
  const [program, setProgramState] = useState("");

  const xtermRef = useRef(null);
  const playgroundRef = useRef(null);

  function setProgram (value) {
    setProgramState(value);
    if (playgroundRef.current) {
      playgroundRef.current.setProgram.apply(playgroundRef.current, [value]);
    }
  }

  useEffect(() => {
    const terminal = xtermRef.current.terminal;
    const playgroundRunner = new PlaygroundRunner(terminal);
    playgroundRef.current = playgroundRunner;

    setProgramState(playgroundRunner.program);

    playgroundRunner.start();
  }, []);

  return (
    <>
      <Editor 
        height="calc(100vh - 432px)"
        defaultLanguage="javascript"
        value={program}
        theme="vs-dark"
        onChange={setProgram}
      />
      <XTerm ref={xtermRef} options={{ cursorBlink: true }} />
    </>
  );
}
