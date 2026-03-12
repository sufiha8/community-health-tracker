import jsPDF from "jspdf";

export function generateHealthReport(logs = [], profile = {}) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Monthly Health Report", 20, 20);
  doc.setFontSize(12);
  if (profile.username) doc.text(`Name: ${profile.username}`, 20, 30);
  logs.forEach((l, idx) => {
    const y = 40 + idx * 10;
    doc.text(`${l.date} - BP ${l.bp || "-"} - Sugar ${l.sugar || "-"}`, 20, y);
  });
}

export function exportLogsCSV(logs = []) {
  const header = ["date", "bp", "sugar", "symptoms", "risks"];
  const rows = logs.map((l) => [
    l.date || "",
    l.bp || "",
    l.sugar || "",
    Array.isArray(l.symptoms) ? l.symptoms.join(",") : l.symptoms || "",
    Array.isArray(l.risks) ? l.risks.join(",") : l.risks || "",
  ]);
  const csvContent = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "health-logs.csv";
  a.click();
  URL.revokeObjectURL(url);
  doc.save("health-report.pdf");
}
