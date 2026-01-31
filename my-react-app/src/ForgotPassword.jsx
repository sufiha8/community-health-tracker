import { api } from "./api";
import AuthLayout from "./AuthLayout";

export default function ForgotPassword({ setPage, setPhone }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = e.target.phone.value;

    if (!phone) {
      alert("Phone required");
      return;
    }

    try {
      await api.post("/forgot-password", { phone });
      setPhone(phone);
      setPage("reset");
    } catch {
      alert("Failed to generate OTP");
    }
  };

  return (
    <AuthLayout>
      <h3 className="app-title">Community Health Tracker</h3>
      <h2 className="welcome">Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <input name="phone" placeholder="Phone Number" />
        <button className="primary-btn">Generate OTP</button>
      </form>

      <p className="link-text" onClick={() => setPage("login")}>
        Back to Login
      </p>
    </AuthLayout>
  );
}
