"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "#1e293b", // slate-800
      titleColor: "#fff",
      bodyColor: "#cbd5e1", // slate-300
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(203, 213, 225, 0.1)",
      },
      ticks: {
        color: "#94a3b8",
      },
    },
    y: {
      grid: {
        color: "rgba(203, 213, 225, 0.1)",
      },
      ticks: {
        color: "#94a3b8",
      },
    },
  },
};

export const data = {
  labels,
  datasets: [
    {
      fill: true,
      label: "Revenue",
      data: [3000, 5000, 4000, 6000, 7500, 9000],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      pointBackgroundColor: "#3b82f6",
      pointRadius: 5,
      pointHoverRadius: 6,
      tension: 0.4,
    },
  ],
};

export default function RevenueChart() {
  return (
    <div className="h-[300px] w-full px-2">
      <Line options={options} data={data} />
    </div>
  );
}
