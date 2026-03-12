import { useState, useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Login from "./Login";
import "./i18n"; // initialize internationalization
import Register from "./Register";
import UserProfile from "./UserProfile.jsx";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import AdminPanel from "./AdminPanel";
import VaccineSchedule from "./VaccineSchedule";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "./firebase";
import { ToastProvider } from "./ToastContext";

export default function App() {
  const [page, setPage] = useState("login");
  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfile(null);
        setPage("login");
        setLoading(false);
        return;
      }

      try {
        const snap = await get(ref(db, `users/${user.uid}`));
        const p = snap.exists() ? snap.val() : null;
        // ensure email field exists using auth info
        const enriched = p
          ? { ...p, email: p.email || user.email }
          : { email: user.email };
        setProfile(enriched);
        if (p?.blocked) {
          setBlocked(true);
          alert("This account has been blocked by the administrator.");
          await auth.signOut();
          setPage("login");
          setLoading(false);
          return;
        }
        if (p?.prefs?.language) {
          import("./i18n").then((mod) =>
            mod.default.changeLanguage(p.prefs.language),
          );
        }

        if (p?.role === "admin") {
          setPage("admin");
        } else {
          const hasProfile = p && (p.username || p.age || p.phone || p.address);
          // if user already has profile info, go to community dashboard; else show profile page to fill
          if (hasProfile) setPage("userprofile");
          else setPage("userprofile");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) return null;

  let content = null;
  if (page === "login") content = <Login setPage={setPage} />;
  else if (page === "register") content = <Register setPage={setPage} />;
  else if (page === "forgot")
    content = <ForgotPassword setPage={setPage} setPhone={setPhone} />;
  else if (page === "reset")
    content = <ResetPassword setPage={setPage} phone={phone} />;
  else if (page === "admin") content = <AdminPanel />;
  else if (page === "userprofile")
    content = (
      <UserProfile
        userProfile={profile}
        initialPage={
          profile && (profile.username || profile.age) ? "community" : "profile"
        }
      />
    );

  // helper component used in route
  function VaccineDetail() {
    const { id } = useParams();
    return <VaccineSchedule driveId={id} />;
  }

  return (
    <ToastProvider>
      <Routes>
        <Route path="/vaccine/:id" element={<VaccineDetail />} />
        <Route path="*" element={content} />
      </Routes>
    </ToastProvider>
  );
}
