import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";

import * as api from "../../services/api/auth";

import UserContext from "../../contexts/UserContext";

import {
  Input,
  Button
} from "../../components/Form";

import AuthLayout from "../../layouts/Auth";

export default function Login () {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useContext(UserContext);
  const history = useHistory();

  function login (event) {
    event.preventDefault();

    api.login(username, password).then(response => {
      setUser(response);
      history.push("/");
    }).catch(() => {
      alert("Erro ao fazer login! Tente novamente mais tarde...");
    });
  }
  
  function forgotPassword () {
    alert("Por enquanto isso aqui não funciona não");
  }

  return (
    <AuthLayout>
      <form onSubmit={login}>
        <Input type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} />
        <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="success" success>Entrar</Button>
      </form>
      <Button noBackground onClick={forgotPassword}>Esqueceu sua senha?</Button>
    </AuthLayout>
  );
}