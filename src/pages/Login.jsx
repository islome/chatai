import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleContinue = (e) => {
    e.preventDefault();
    if (username === "bro" && password === "1111") {
      navigate("/chat");
    }
    console.log("Continue with:", username, password);
  };

  return (
    <div className="login-container">
      <h1 style={{ position: "absolute", left: "10px", top: "10px" }}>ChatBro</h1>
      <div className="login-box">
        <h1 className="welcome-text">Welcome back</h1>
        <form onSubmit={handleContinue}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="username-input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="username-input"
            required
          />
          <button type="submit" className="continue-button">
            Continue
          </button>
        </form>
        <p className="signup-text">
          Don't have an account?{" "}
          <a href="#" className="signup-link">
            Sign up
          </a>
        </p>
        <div className="or-text">OR</div>
        <button className="social-button google">
          <span className="iconchala">🌐</span> Continue with Google
        </button>
        <button className="social-button microsoft">
          <span className="iconchala">🪟</span> Continue with Microsoft Account
        </button>
        <button className="social-button apple">
          <span className="iconchala">🍎</span> Continue with Apple
        </button>
        <button className="social-button phone">
          <span className="iconchala">📞</span> Continue with phone
        </button>
      </div>
    </div>
  );
};

export default Login;