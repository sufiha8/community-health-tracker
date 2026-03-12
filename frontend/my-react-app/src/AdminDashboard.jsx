import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function AdminDashboard() {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [userMap, setUserMap] = useState({});
  const [activeToday, setActiveToday] = useState(0);
  const [highRiskUsers, setHighRiskUsers] = useState(0);
  const [symptomCounts, setSymptomCounts] = useState({});
  const [bpTrend, setBpTrend] = useState({ labels: [], data: [] });
  const [sugarTrend, setSugarTrend] = useState({ labels: [], data: [] });
  const [riskPerDate, setRiskPerDate] = useState({});
  const [emergencies, setEmergencies] = useState([]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const usersRef = ref(db, "users");
    const logsRef = ref(db, "healthLogs");

    const unsubUsers = onValue(usersRef, (snap) => {
      const users = snap.val() || {};
      setTotalUsers(Object.keys(users).length);
      setUserMap(users);
    });

    const eRef = ref(db, "emergencies");
    const unsubEmerg = onValue(eRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]) => ({ id, ...v }));
      setEmergencies(arr);
    });

    const unsubLogs = onValue(logsRef, (snap) => {
      const logs = snap.val() || {};
      const today = new Date().toLocaleDateString();
      let active = 0;
      let highRisk = new Set();
      const symptomFreq = {};
      const bpSeries = {};
      const sugarSeries = {};

      Object.entries(logs).forEach(([uid, userLogs]) => {
        Object.values(userLogs).forEach((l) => {
          const date = l.date || new Date(l.createdAt).toLocaleDateString();
          if (date === today) active++;
          if (Array.isArray(l.risks) && l.risks.length) {
            highRisk.add(uid);
            riskPerDate[date] = (riskPerDate[date] || 0) + 1;
          }
          if (l.symptoms) {
            l.symptoms.split(",").forEach((s) => {
              const w = s.trim().toLowerCase();
              if (w) symptomFreq[w] = (symptomFreq[w] || 0) + 1;
            });
          }
          if (l.bp) {
            bpSeries[date] =
              (bpSeries[date] || 0) + parseInt(l.bp.split("/")[0], 10);
          }
          if (l.sugar) {
            const sugarVal = parseInt(l.sugar.replace(/[^0-9]/g, ""), 10);
            sugarSeries[date] = (sugarSeries[date] || 0) + sugarVal;
          }
        });
      });
      setRiskPerDate(riskPerDate);

      setActiveToday(active);
      setHighRiskUsers(highRisk.size);
      setSymptomCounts(symptomFreq);

      // build trends data
      const dates = Object.keys(bpSeries).sort();
      setBpTrend({ labels: dates, data: dates.map((d) => bpSeries[d]) });
      setSugarTrend({ labels: dates, data: dates.map((d) => sugarSeries[d]) });
    });

    return () => {
      unsubUsers();
      unsubEmerg();
      unsubLogs();
    };
  }, []);

  return (
    <div className="dashboard-page">
      {/* Content is shown within AdminPanel sidebar, so omit additional sidebar here */}

      {/* ...existing code... */}
      <div className="dashboard-main">
        {/* Content - topbar is already rendered by AdminPanel, so omit duplicate header */}
        <div className="dashboard-content">
          <h2>Overview</h2>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <p>Total Users</p>
              <h3>{totalUsers}</h3>
            </div>

            <div className="stat-card">
              <p>Active Today</p>
              <h3>{activeToday}</h3>
            </div>

            <div className="stat-card">
              <p>High-risk Users</p>
              <h3>{highRiskUsers}</h3>
            </div>

            <div className="stat-card">
              <p>Emergencies</p>
              <h3>{emergencies.length}</h3>
            </div>

            <div className="stat-card">
              <p>Unique Symptoms</p>
              <h3>{Object.keys(symptomCounts).length}</h3>
            </div>
          </div>

          {/* Trends */}
          <h3 className="section-title">Community Health Trends</h3>

          <div className="charts-grid">
            <div className="chart-card">
              <h4>Community BP Trend</h4>
              <Line
                data={{
                  labels: bpTrend.labels,
                  datasets: [
                    {
                      label: "BP",
                      data: bpTrend.data,
                      borderColor: "#1f7a8c",
                      fill: false,
                    },
                  ],
                }}
              />
            </div>

            <div className="chart-card">
              <h4>Community Sugar Trend</h4>
              <Line
                data={{
                  labels: sugarTrend.labels,
                  datasets: [
                    {
                      label: "Sugar",
                      data: sugarTrend.data,
                      borderColor: "#dc2626",
                      fill: false,
                    },
                  ],
                }}
              />
            </div>

            <div className="chart-card">
              <h4>Symptom Frequency</h4>
              <Pie
                data={{
                  labels: Object.keys(symptomCounts),
                  datasets: [
                    {
                      data: Object.values(symptomCounts),
                      backgroundColor: Object.keys(symptomCounts).map(
                        (_, i) =>
                          [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                          ][i % 5],
                      ),
                    },
                  ],
                }}
              />
            </div>
            <div className="chart-card">
              <h4>Risk Heatmap</h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Risk count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(riskPerDate).map(([d, c]) => (
                    <tr
                      key={d}
                      style={{ background: c > 0 ? "#fee" : "white" }}
                    >
                      <td>{d}</td>
                      <td>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <h3 style={{ marginTop: 40 }}>Recent Emergencies</h3>
          <ul>
            {emergencies.slice(-5).map((e) => (
              <li key={e.id}>
                {userMap[e.uid]?.username || e.uid} -{" "}
                {new Date(e.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
