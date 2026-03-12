import { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import { ref as dbRef, set, get } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useToast } from "./ToastContext";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [language, setLanguage] = useState(i18n.language);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // basic profile fields from registration
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");

  // admin user list
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      get(dbRef(db, `users/${uid}`)).then((snap) => {
        if (snap.exists()) {
          const data = snap.val();
          setAvatarUrl(data.avatar || "");
          setNotificationsEnabled(data.prefs?.notificationsEnabled ?? true);
          setLanguage(data.prefs?.language || i18n.language);
          setUsername(data.username || "");
          setAge(data.age || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setRole(data.role || "");
        }
      });

      // if admin, load all users
      get(dbRef(db, "users")).then((snap) => {
        const obj = snap.val() || {};
        const arr = Object.entries(obj).map(([uid, u]) => ({
          uid,
          ...u,
          email: u.email || "(no email)",
          phone: u.phone || "(no phone)",
        }));
        setUsersList(arr);
      });
    }
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const savePrefs = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      // if avatar file pending, upload first
      if (avatarFile) {
        const sRef = storageRef(storage, `avatars/${uid}`);
        await uploadBytes(sRef, avatarFile);
        const url = await getDownloadURL(sRef);
        setAvatarUrl(url);
        await set(dbRef(db, `users/${uid}/avatar`), url);
        showToast("Avatar uploaded", "success");
      }

      // update profile fields
      await set(dbRef(db, `users/${uid}`), {
        username,
        age,
        phone,
        address,
        role,
      });

      // update prefs
      await set(dbRef(db, `users/${uid}/prefs`), {
        notificationsEnabled,
        language,
      });
      i18n.changeLanguage(language);
      showToast("Preferences saved", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save preferences", "error");
    }
  };

  return (
    <div className="settings-card">
      <h3>{t("Settings")}</h3>

      <div className="form-group">
        {/* no text label for avatar; upload button below */}
        <label className="upload-btn">
          {t("Change avatar")}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </label>
        {(previewUrl || avatarUrl) && (
          <img
            src={previewUrl || avatarUrl}
            alt="avatar"
            style={{ width: 80, height: 80, borderRadius: "50%" }}
          />
        )}
      </div>

      {/* profile fields */}
      <div className="form-group">
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Address</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <hr />

      <div className="form-group">
        <label>{t("Language")}</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled((v) => !v)}
          />
          {t("Enable push notifications")}
        </label>
      </div>

      <button className="primary-btn" onClick={savePrefs}>
        {t("Save Settings")}
      </button>

      {/* admin user management */}
      {role === "admin" && (
        <>
          <hr />
          <h4>User Management</h4>
          {usersList.length === 0 ? (
            <p>No users</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Blocked</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.uid}>
                    <td>{u.username || u.email || "(no name)"}</td>
                    <td>
                      {u.email || "(no email)"}
                      {(!u.email || u.email === "(no email)") && (
                        <button
                          className="outline-btn"
                          style={{
                            marginLeft: 8,
                            padding: "4px 8px",
                            fontSize: 12,
                          }}
                          onClick={async () => {
                            const newEmail = window.prompt(
                              "Enter email address for this user:",
                              "",
                            );
                            if (newEmail) {
                              try {
                                await set(
                                  dbRef(db, `users/${u.uid}/email`),
                                  newEmail,
                                );
                                setUsersList((lst) =>
                                  lst.map((x) =>
                                    x.uid === u.uid
                                      ? { ...x, email: newEmail }
                                      : x,
                                  ),
                                );
                                showToast("Email updated", "success");
                              } catch (err) {
                                console.error(err);
                                showToast("Failed to set email", "error");
                              }
                            }
                          }}
                        >
                          Add
                        </button>
                      )}
                    </td>
                    <td>{u.role}</td>
                    <td>
                      <button
                        className="outline-btn"
                        onClick={async () => {
                          try {
                            await set(
                              dbRef(db, `users/${u.uid}/blocked`),
                              !u.blocked,
                            );
                            setUsersList((lst) =>
                              lst.map((x) =>
                                x.uid === u.uid
                                  ? { ...x, blocked: !x.blocked }
                                  : x,
                              ),
                            );
                          } catch (err) {
                            console.error(err);
                            showToast("Failed to update user", "error");
                          }
                        }}
                      >
                        {u.blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
