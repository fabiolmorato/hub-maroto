import styled from "styled-components";

import Logo from "../components/Logo";

import matrix from "../assets/images/matrix.gif";

export default function Auth ({ children }) {
  return (
    <Container>
      <Backdrop />
      <View>
        <Logo />
        {children}
      </View>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #00407B;
`;

const Backdrop = styled.div`
  background-image: url(${matrix});
  background-size: cover;
  filter: blur(3px);
  z-index: 0;
  opacity: .1;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
`;

const View = styled.div`
  width: 360px;
  max-width: 100%;
  display: flex;
  flex-direction: column;

  * {
    z-index: 1;
  }
`;
