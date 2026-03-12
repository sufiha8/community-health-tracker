import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { useTranslation } from "react-i18next";

export default function AuditDashboard() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const aRef = ref(db, "audit");
    const unsub = onValue(aRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, e]) => ({ id, ...e }));
      setEntries(arr.sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <h3>{t("Audit Log")}</h3>
      {entries.length === 0 ? (
        <p>No entries</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
                <td>{e.uid}</td>
                <td>{e.action}</td>
                <td>
                  <pre>{JSON.stringify(e.details)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
