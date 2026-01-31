import { api } from "./api";
import AuthLayout from "./AuthLayout";

export default function ResetPassword({ phone, setPage }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;
    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;

    if (!otp || !pass1 || !pass2) {
      alert("All fields required");
      return;
    }

    if (pass1 !== pass2) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.post("/reset-password", {
        phone,
        otp,
        newPassword: pass1,
      });

      alert("Password reset successful");
      setPage("login");
    } catch {
      alert("Reset failed");
    }
  };

  return (
    <AuthLayout>
      <h3 className="app-title">Community Health Tracker</h3>
      <h2 className="welcome">Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input name="otp" placeholder="OTP" />
        <input name="pass1" type="password" placeholder="New Password" />
        <input name="pass2" type="password" placeholder="Confirm Password" />

        <button className="primary-btn">Reset Password</button>
      </form>
    </AuthLayout>
  );
}
