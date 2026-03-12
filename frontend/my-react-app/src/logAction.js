import { push, ref } from "firebase/database";
import { db, auth } from "./firebase";

export async function logAction(action, details = {}) {
  try {
    const uid = auth.currentUser?.uid || "unknown";
    await push(ref(db, "audit"), {
      uid,
      action,
      details,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error("logAction failed", err);
  }
}
