import { useState } from "react";
import { login } from "../services/authService";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login(username, password);

      localStorage.setItem("token", data.token);

      alert("Login berhasil!");
    } catch (error) {
      alert("Login gagal!");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;