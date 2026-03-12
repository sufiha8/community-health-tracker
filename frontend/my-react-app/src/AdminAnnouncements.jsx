import { useEffect, useState } from "react";
import { ref, push, onValue, get, update } from "firebase/database";
import { db, auth } from "./firebase";
import { useToast } from "./ToastContext";
import { useTranslation } from "react-i18next";
import { logAction } from "./logAction";

export default function AdminAnnouncements() {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [replyText, setReplyText] = useState({}); // keyed by annId->commentId
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !body)
      return showToast(t("Title and body required"), "error");

    try {
      const annRef = ref(db, "announcements");
      const newAnn = {
        title,
        body,
        createdAt: Date.now(),
        author: auth.currentUser ? auth.currentUser.uid : null,
      };
      const p = await push(annRef, newAnn);
      // record audit
      logAction("announcement_create", { title });
      setTitle("");
      setBody("");
      showToast(t("Announcement posted"), "success");

      // broadcast notification to all users
      const usersSnap = await get(ref(db, "users"));
      const users = usersSnap.val() || {};
      const updates = {};
      Object.keys(users).forEach((uid) => {
        const notifPath = `/notifications/${uid}`;
        const key = push(ref(db, notifPath)).key;
        updates[`${notifPath}/${key}`] = {
          text: `New announcement: ${title}`,
          annId: p.key,
          link: `/announcements/${p.key}`,
          createdAt: Date.now(),
          read: false,
        };
      });
      if (Object.keys(updates).length) {
        await update(ref(db), updates);
      }
    } catch (err) {
      console.error(err);
      showToast(t("Failed to post announcement"), "error");
    }
  };

  const handleReply = async (annId, commentId) => {
    const text = (replyText[`${annId}_${commentId}`] || "").trim();
    if (!text) return showToast("Reply cannot be empty", "error");

    try {
      const user = auth.currentUser;
      const profileSnap = await get(ref(db, `users/${user.uid}`));
      const profile = profileSnap.exists() ? profileSnap.val() : {};
      const name = profile.username || user.email || "Admin";

      const repliesRef = ref(
        db,
        `announcements/${annId}/comments/${commentId}/replies`,
      );
      const rRef = await push(repliesRef, {
        uid: user.uid,
        name,
        text,
        role: "admin",
        createdAt: Date.now(),
      });

      // notify commenter that admin replied
      try {
        const commentOwnerUid = (
          await get(ref(db, `announcements/${annId}/comments/${commentId}/uid`))
        ).val();
        if (commentOwnerUid) {
          // fetch announcement title to include in notification text
          const titleSnap = await get(ref(db, `announcements/${annId}/title`));
          const annTitle = titleSnap.exists() ? titleSnap.val() : "";
          const notifRef = ref(db, `notifications/${commentOwnerUid}`);
          await push(notifRef, {
            text: `${name} replied to your comment on "${annTitle}"`,
            annId,
            commentId,
            replyId: rRef.key,
            fromUid: user.uid,
            fromName: name,
            read: false,
            createdAt: Date.now(),
          });
        }
      } catch (err) {
        console.error("Failed to notify commenter", err);
      }

      setReplyText((s) => ({ ...s, [`${annId}_${commentId}`]: "" }));
      showToast(t("Replied to comment"), "success");
      logAction("comment_reply", { annId, commentId });
    } catch (err) {
      console.error(err);
      showToast(t("Failed to post reply"), "error");
    }
  };

  return (
    <div>
      {/* top-level heading often provided by parent container, drop this one */}
      {/* <h3>Announcements</h3> */}

      <form onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Content"
        />
        <button className="primary-btn">Post Announcement</button>
      </form>

      <hr />

      <div>
        {announcements.length === 0 ? (
          <p>No announcements yet.</p>
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
                    setShowComments((prev) => ({
                      ...prev,
                      [a.id]: !prev[a.id],
                    }))
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
                  <div
                    className={`comments-container ${showComments[a.id] ? "open" : ""}`}
                  >
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

                            {/* replies */}
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

                            <div style={{ marginTop: 6 }}>
                              <textarea
                                rows={2}
                                placeholder="Reply to this comment..."
                                value={replyText[`${a.id}_${c.id}`] || ""}
                                onChange={(e) =>
                                  setReplyText((s) => ({
                                    ...s,
                                    [`${a.id}_${c.id}`]: e.target.value,
                                  }))
                                }
                                style={{ width: "100%" }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  marginTop: 6,
                                }}
                              >
                                <button
                                  className="primary-btn"
                                  onClick={() => handleReply(a.id, c.id)}
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div style={{ color: "#666" }}>No comments yet.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
