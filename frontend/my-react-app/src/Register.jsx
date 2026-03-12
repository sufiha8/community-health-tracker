import AuthLayout from "./AuthLayout";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "./firebase";

import { useToast } from "./ToastContext";

export default function Register({ setPage }) {
  const { showToast } = useToast();
  const [role, setRole] = useState("user");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    // determine required fields depending on chosen role
    const required = [
      "username",
      "age",
      "email",
      "phone",
      "address",
      "password",
      "role",
    ];
    // if admin is selected, adminCode will also be checked later separately
    const missing = required.find(
      (key) => !(data[key] || "").toString().trim(),
    );
    if (missing) {
      showToast(`Field '${missing}' is required`, "error");
      return;
    }

    // basic client-side validation
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if ((data.password || "").length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    const role = data.role || "user";

    // Protect admin signup with an admin code from env
    if (role === "admin") {
      const adminCode = data.adminCode || "";
      const expected = import.meta.env.VITE_ADMIN_SIGNUP_CODE || "";
      if (!expected || adminCode !== expected) {
        showToast(
          "Invalid admin code. Admin registration is restricted.",
          "error",
        );
        return;
      }
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const uid = userCred.user.uid;
      await set(ref(db, `users/${uid}`), {
        username: data.username,
        age: data.age,
        email: data.email,
        phone: data.phone,
        address: data.address,
        role: role,
      });

      showToast("Registered successfully", "success");
      setPage("login");
    } catch (err) {
      console.error("Registration error:", err);
      // show Firebase error if available
      const msg = err?.code
        ? `${err.code}: ${err.message}`
        : "Registration failed";
      showToast(msg, "error");
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

        <label>Role</label>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {role === "admin" && (
          <>
            <div style={{ marginTop: 8 }}>
              <small>
                To register as an admin, provide the admin code in the next
                step.
              </small>
            </div>

            <input name="adminCode" placeholder="Admin Code (admin only)" />
          </>
        )}

        <button className="primary-btn">Register</button>
      </form>

      <p className="link-text" onClick={() => setPage("login")}>
        Back to Login
      </p>
    </AuthLayout>
  );
}
