import "./UserProfile.css";
import { useEffect, useState } from "react";
import { ref, onValue, push, get } from "firebase/database";
import { db, auth } from "./firebase";
import { useToast } from "./ToastContext";
import { useTranslation } from "react-i18next";
import { logAction } from "./logAction";

export default function CommunityDashboard() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [commentText, setCommentText] = useState({}); // keyed by announcement id
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const annRef = ref(db, "announcements");
    const unsub = onValue(annRef, (snap) => {
      const val = snap.val();
      const arr = val
        ? Object.entries(val)
            .map(([id, a]) => ({ id, ...a }))
            .sort((a, b) => b.createdAt - a.createdAt)
        : [];
      setAnnouncements(arr);
    });

    return () => unsub();
  }, []);

  const handleAddComment = async (annId) => {
    const text = (commentText[annId] || "").trim();
    if (!text) return showToast("Comment cannot be empty", "error");
    logAction("comment_create", { annId });

    const user = auth.currentUser;
    if (!user) return showToast("Please login to comment", "error");

    try {
      // try to get display name from users/{uid}
      const profileSnap = await get(ref(db, `users/${user.uid}`));
      const profile = profileSnap.exists() ? profileSnap.val() : {};
      const name = profile.username || user.email || "User";

      const commentsRef = ref(db, `announcements/${annId}/comments`);
      const cRef = await push(commentsRef, {
        uid: user.uid,
        name,
        text,
        createdAt: Date.now(),
      });

      // notify all admins about new comment
      try {
        const usersSnap = await get(ref(db, "users"));
        const usersVal = usersSnap.val() || {};
        // fetch announcement title for context
        const titleSnap = await get(ref(db, `announcements/${annId}/title`));
        const annTitle = titleSnap.exists() ? titleSnap.val() : "";
        Object.entries(usersVal).forEach(([uid, profile]) => {
          if (profile.role === "admin") {
            const notifRef = ref(db, `notifications/${uid}`);
            push(notifRef, {
              text: `${name} commented on "${annTitle}"`,
              annId,
              commentId: cRef.key,
              fromUid: user.uid,
              fromName: name,
              read: false,
              createdAt: Date.now(),
            });
          }
        });
      } catch (err) {
        console.error("Failed to notify admins", err);
      }

      setCommentText((s) => ({ ...s, [annId]: "" }));
      showToast("Comment posted", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to post comment", "error");
    }
  };

  return (
    <div className="profile-card">
      <h3>{t("Community Dashboard")}</h3>

      <div className="announcements">
        {announcements.length === 0 ? (
          <p>{t("No announcements yet.")}</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="announcement-card">
              <h4>{a.title}</h4>
              <p>{a.body}</p>
              <small>{new Date(a.createdAt).toLocaleString()}</small>

              <div style={{ marginTop: 12 }}>
                <h5>Comments</h5>
                <button
                  className="outline-btn"
                  style={{ marginBottom: 8 }}
                  onClick={() =>
                    setShowComments((p) => ({ ...p, [a.id]: !p[a.id] }))
                  }
                >
                  {showComments[a.id] ? "Hide" : "Show"} comments
                  {a.comments && Object.keys(a.comments).length > 0 && (
                    <span className="badge" style={{ marginLeft: 6 }}>
                      {Object.keys(a.comments).length}
                    </span>
                  )}
                </button>

                {showComments[a.id] && (
                  <div>
                    {a.comments ? (
                      Object.entries(a.comments)
                        .map(([cid, c]) => ({ id: cid, ...c }))
                        .sort((x, y) => x.createdAt - y.createdAt)
                        .map((c) => (
                          <div key={c.id} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 13, color: "#333" }}>
                              <strong>{c.name}</strong> •{" "}
                              <small>
                                {new Date(c.createdAt).toLocaleString()}
                              </small>
                            </div>
                            <div style={{ marginTop: 4 }}>{c.text}</div>

                            {/* show admin replies, if any */}
                            {c.replies && (
                              <div style={{ marginLeft: 12, marginTop: 6 }}>
                                {Object.entries(c.replies)
                                  .map(([rid, r]) => ({ id: rid, ...r }))
                                  .sort((x, y) => x.createdAt - y.createdAt)
                                  .map((r) => (
                                    <div key={r.id} style={{ marginTop: 6 }}>
                                      <div
                                        style={{ fontSize: 13, color: "#0b5" }}
                                      >
                                        <strong>{r.name}</strong> •{" "}
                                        <small>
                                          {new Date(
                                            r.createdAt,
                                          ).toLocaleString()}
                                        </small>
                                      </div>
                                      <div style={{ marginTop: 4 }}>
                                        {r.text}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      <div style={{ color: "#666" }}>No comments yet.</div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 8 }}>
                  <textarea
                    rows={2}
                    placeholder="Write a comment..."
                    value={commentText[a.id] || ""}
                    onChange={(e) =>
                      setCommentText((s) => ({ ...s, [a.id]: e.target.value }))
                    }
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button
                      className="primary-btn"
                      onClick={() => handleAddComment(a.id)}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
