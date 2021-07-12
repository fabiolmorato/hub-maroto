import styled from "styled-components";

import { ReactComponent as Computer } from "../assets/images/laptop-outline.svg";

export default function Logo () {
  return (
    <Container>
      <div className="icon">
        <Computer />
        <div className="hub">HUB</div>
      </div>


      <div className="title">Maroto</div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  
  * {
    user-select: none;
  }

  .icon {
    position: relative;
    color: #CCCCCC;
    right: -3px;
  }

  .hub {
    position: absolute;
    color: #CCCCCC;
    font-size: 14px;
    font-family: 'Roboto', sans-serif;
    letter-spacing: -0.09em;
    top: 25px;
    left: 19px;
  }

  .title {
    font-family: 'Pacifico', cursive;
    font-size: 64px;
    position: relative;
    color: #F7F7F7;
    top: -5.5px;
    left: -3px;
  }
`;
