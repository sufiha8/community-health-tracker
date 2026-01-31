import { api } from "./api";
import AuthLayout from "./AuthLayout";

export default function Register({ setPage }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    if (Object.values(data).some(v => !v)) {
      alert("All fields required");
      return;
    }

    try {
      await api.post("/register", data);
      alert("Registered successfully");
      setPage("login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <AuthLayout>
      <h3 className="app-title">Community Health Tracker</h3>
      <h2 className="welcome">Create Account</h2>

      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" />
        <input name="age" placeholder="Age" />
        <input name="email" placeholder="Email" />
        <input name="phone" placeholder="Phone" />
        <input name="address" placeholder="Address" />
        <input name="password" type="password" placeholder="Password" />

        <button className="primary-btn">Register</button>
      </form>

      <p className="link-text" onClick={() => setPage("login")}>
        Back to Login
      </p>
    </AuthLayout>
  );
}
