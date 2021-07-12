import styled from "styled-components";

const Input = styled.button`
  font-family: 'Lexend Deca', sans-serif;
  padding: 14px;
  background-color: ${props => (
    (props.success && "#22A63F") ||
    (props.noBackground && "transparent") ||
    "#00407B"
  )};
  color: #FFFFFF;
  font-size: 14px;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  margin-bottom: 10px;

  &:hover {
    filter: brightness(1.1);
  }
`;

export default Input;
