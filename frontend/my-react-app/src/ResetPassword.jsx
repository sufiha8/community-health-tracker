import AuthLayout from "./AuthLayout";

export default function ResetPassword({ setPage }) {
  return (
    <AuthLayout>
      <h3 className="app-title">Community Health Tracker</h3>
      <h2 className="welcome">Reset Password</h2>

      <p>
        We use email-based password reset links. If you requested a reset, check
        your email and follow the link to set a new password. When done, return
        to login.
      </p>

      <button className="primary-btn" onClick={() => setPage("login")}>
        Back to Login
      </button>
    </AuthLayout>
  );
}
