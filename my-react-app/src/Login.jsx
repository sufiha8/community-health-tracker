
import { api } from "./api";
import AuthLayout from "./AuthLayout";

export default function Login({ setPage }) {
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      alert("All fields are required");
      return;
    }

    // Check if user exists before login
    try {
      const usersRes = await api.get("/users");
      const userExists = usersRes.data.some(u => u.email === email);
      if (!userExists) {
        alert("You don't have an existing account, please register first.");
        return;
      }
    } catch {
      alert("Server error. Please try again later");
      return;
    }

    // Try login
    try {
      const res = await api.post("/login", { email, password });
      alert(`Logged in as ${res.data.role}`);
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <AuthLayout>
      <h3 className="app-title">Community Health Tracker</h3>
      <h2 className="welcome">Welcome Back!</h2>
      <p className="subtitle">Log in or create an account to get started.</p>

      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input name="email" />

        <label>Password</label>
        <input name="password" type="password" />

        <button className="primary-btn" type="submit">Login</button>
      </form>

      {/* SAME SIZE REGISTER BUTTON */}
      <button
        className="primary-btn"
        style={{ marginTop: '12px', width: '100%' }}
        onClick={() => setPage("register")}
      >
        Register
      </button>

      <p className="link-text" onClick={() => setPage("forgot")}>
        Forgot Password?
      </p>
    </AuthLayout>
  );
}
