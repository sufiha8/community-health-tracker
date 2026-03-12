import AuthLayout from "./AuthLayout";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "./firebase";

import { useToast } from "./ToastContext";

export default function Login({ setPage }) {
  const { showToast } = useToast();
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      const snapshot = await get(ref(db, `users/${uid}`));
      const profile = snapshot.exists() ? snapshot.val() : null;
      const role = profile?.role || "user";

      if (role === "admin") {
        showToast("Welcome, admin", "success");
        setPage("admin");
        return;
      }

      // If user already has profile info, send to community dashboard; otherwise open profile page
      const hasProfile =
        profile &&
        (profile.username || profile.age || profile.phone || profile.address);
      if (hasProfile) {
        showToast("Welcome back!", "success");
        setPage("userprofile");
      } else {
        showToast("Welcome! Please complete your profile.", "info");
        setPage("userprofile");
      }
    } catch (err) {
      console.error(err);
      const msg = err?.code
        ? `${err.code}: ${err.message}`
        : "Invalid credentials or server error";
      showToast(msg, "error");
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

        <button className="primary-btn" type="submit">
          Login
        </button>
      </form>

      {/* SAME SIZE REGISTER BUTTON */}
      <button
        className="primary-btn"
        style={{ marginTop: "12px", width: "100%" }}
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
