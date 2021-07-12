import {
  Input,
  Button
} from "../../components/Form";

import AuthLayout from "../../layouts/Auth";

export default function Login () {
  function forgotPassword () {
    alert("Chuchu, infelizmente não tive tempo de fazer essa parte ainda não. Mas só me pedir pra trocar <3");
  }

  return (
    <AuthLayout>
      <form>
        <Input type="text" placeholder="Usuário" />
        <Input type="password" placeholder="Senha" />
        <Button type="success" success>Entrar</Button>
      </form>
      <Button noBackground onClick={forgotPassword}>Esqueceu sua senha?</Button>
    </AuthLayout>
  );
}