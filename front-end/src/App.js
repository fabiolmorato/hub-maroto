import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { useContext } from "react";

import UserContext, { UserProvider } from "./contexts/UserContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Playground from "./pages/Playground";

import "./assets/styles/reset.css";
import "./assets/styles/style.css";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Switch>
          <ProtectedRoute path="/" exact>
            <Home />
          </ProtectedRoute>

          <Route path="/playground" exact>
            <Playground />
          </Route>

          <UnprotectedRoute path="/login" exact>
            <Login />
          </UnprotectedRoute>
        </Switch>
      </Router>
    </UserProvider>
  );
}

function ProtectedRoute ({ redirect="/login", ...props }) {
  const { user } = useContext(UserContext);

  if (!user) {
    return (
      <Redirect to={redirect} />
    );
  }

  return (
    <Route {...props} />
  );
}

function UnprotectedRoute ({ redirect="/", ...props }) {
  const { user } = useContext(UserContext);

  if (user) {
    return (
      <Redirect to={redirect} />
    );
  }

  return (
    <Route {...props} />
  );
}
