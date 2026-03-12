export default function HealthScore({ logs = [] }) {
  if (logs.length === 0) return <div>No data for health score</div>;
  let total = 0;
  logs.forEach((l) => {
    let score = 100;
    const parts = (l.bp || "").split("/").map((v) => parseInt(v, 10));
    if (parts.length >= 2) {
      const [sys, dia] = parts;
      if (!isNaN(sys) && sys > 140) score -= 20;
      if (!isNaN(dia) && dia > 90) score -= 20;
    }
    const sugar = parseInt((l.sugar || "").replace(/[^0-9]/g, ""), 10);
    if (!isNaN(sugar) && sugar > 140) score -= 20;
    total += score;
  });
  const avg = Math.round(total / logs.length);
  return <div>Your health score: {avg}</div>;
}
