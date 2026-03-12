import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function HealthTrendsChart({ logs = [] }) {
  const dates = logs.map((l) => l.date);
  const systolic = logs.map((l) => {
    const parts = (l.bp || "").split("/").map((v) => parseInt(v, 10));
    return parts[0] || 0;
  });
  const sugarVals = logs.map((l) => parseInt(l.sugar || "0", 10));

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Systolic BP",
        data: systolic,
        borderColor: "#1f7a8c",
        fill: false,
      },
      {
        label: "Blood Sugar",
        data: sugarVals,
        borderColor: "#dc2626",
        fill: false,
      },
    ],
  };

  return <Line data={data} />;
}
