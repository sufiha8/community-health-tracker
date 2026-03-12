import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
// firebase messaging for push notifications (requires VITE_VAPID_KEY env var and sw)
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

// request permission and log token
if (messaging) {
  getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_KEY })
    .then((currentToken) => {
      console.log("FCM token", currentToken);
      // TODO: send token to server or store in database under user
    })
    .catch((err) => {
      console.warn("Unable to get messaging token", err);
    });

  onMessage(messaging, (payload) => {
    console.log("Foreground message", payload);
    // show toast or notification
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
