import { useContext } from "react";

import UserContext from "../contexts/UserContext";

export default function Home () {
  const { setUser } = useContext(UserContext);

  function logout () {
    setUser(null);
  }

  return (
    <>
      <h1>Home</h1>
      <button onClick={logout}>Sair</button>
    </>
  );
}
