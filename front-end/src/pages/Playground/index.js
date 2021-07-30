import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { XTerm } from "xterm-for-react";
import styled from "styled-components";

import PlaygroundRunner from "../../assets/libs/playground/Playground";
import TerminalController from "../../assets/libs/playground/TerminalController";

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
    const playgroundRunner = new PlaygroundRunner(new TerminalController(terminal));
    playgroundRef.current = playgroundRunner;

    playgroundRunner.start();

    setProgram(playgroundRunner.getProgram());
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
      <TerminalContainer>
        <XTerm ref={xtermRef} options={{ cursorBlink: true }} />
      </TerminalContainer>
    </>
  );
}

const TerminalContainer = styled.div`
  width: 100%;
  height: 432px;

  .xterm-screen, canvas {
    height: 432px !important;
  }
`;
