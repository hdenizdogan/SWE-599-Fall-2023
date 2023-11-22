import React, { useState } from "react";
import axios from "axios";
import "./css/Login.css";
import { useNavigate } from "react-router-dom";

function LoginComponent() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const Navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();

    axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/login`,
        { identifier, password },
        { withCredentials: true }
      )
      .then((response) => {
        const cookieValue = response.headers["bearer"];
        localStorage.setItem("authToken", cookieValue);
        Navigate("/istif/all-istifs");
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          setError("Invalid username or password.");
        } else {
          setError("An error occurred while logging in.");
        }
      });
  };

  return (
    <form className="login-form" onSubmit={handleLogin}>
      <h2 className="login-heading">Log In</h2>
      <div className="login-input-group">
        <label htmlFor="identifier" className="login-label">
          Username or Email:
        </label>
        <input
          type="text"
          id="identifier"
          className="login-input"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
      </div>
      <div className="login-input-group">
        <label htmlFor="password" className="login-label">
          Password:
        </label>
        <input
          type="password"
          id="password"
          className="login-input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <button type="submit" className="login-button">
        Log in
      </button>
      {error && <div className="login-error">{error}</div>}
    </form>
  );
}

export default LoginComponent;
