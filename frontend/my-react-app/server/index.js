import express from "express";
import cors from "cors";
import { users, otpStore } from "./users.js";

const app = express();
app.use(cors());
app.use(express.json());

// GET USERS (for login existence check)
app.get("/users", (req, res) => {
  res.json(users);
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({ role: user.role });
});

// REGISTER
app.post("/register", (req, res) => {
  const { email } = req.body;
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }
  users.push({ ...req.body, role: "user" });
  console.log("Registered Users:", users);
  res.json({ message: "Registered successfully" });
});

// FORGOT PASSWORD → OTP
app.post("/forgot-password", (req, res) => {
  const { phone } = req.body;
  const user = users.find((u) => u.phone === phone);
  if (!user) {
    return res.status(404).json({ message: "Phone not found" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[phone] = otp;
  console.log("OTP:", otp); // demo purpose
  res.json({ message: "OTP sent" });
});

// RESET PASSWORD
app.post("/reset-password", (req, res) => {
  const { phone, otp, newPassword } = req.body;
  if (otpStore[phone] != otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  const user = users.find((u) => u.phone === phone);
  user.password = newPassword;
  delete otpStore[phone];
  res.json({ message: "Password reset successful" });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
