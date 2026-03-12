import AuthLayout from "./AuthLayout";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import { useToast } from "./ToastContext";

export default function ForgotPassword({ setPage }) {
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    if (!email) {
      showToast("Email required", "error");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset email sent. Check your inbox.", "success");
      setPage("login");
    } catch {
      showToast("Failed to send reset email", "error");
    }
  };

  return (
    <AuthLayout>
      <h3 className="app-title">Community Health Tracker</h3>
      <h2 className="welcome">Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" />
        <button className="primary-btn">Send Reset Email</button>
      </form>

      <p className="link-text" onClick={() => setPage("login")}>
        Back to Login
      </p>
    </AuthLayout>
  );
}
