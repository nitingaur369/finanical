import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CategoryBreakdown } from '../../types';
import { CATEGORY_METADATA, formatINR } from '../../utils/formatters';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  breakdown: CategoryBreakdown[];
}

export const CategoryDoughnutChart: React.FC<Props> = ({ breakdown }) => {
  const activeCategories = breakdown.filter((item) => item.amount > 0);

  if (activeCategories.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-midnight-900/40 border border-white/5">
        <div className="w-12 h-12 rounded-xl bg-midnight-800 text-slate-500 flex items-center justify-center mb-3">
          <PieChart className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-300">No category data yet</p>
        <p className="text-xs text-slate-400 mt-1">Expenses recorded for this month will appear here.</p>
      </div>
    );
  }

  const data = {
    labels: activeCategories.map((c) => c.category),
    datasets: [
      {
        data: activeCategories.map((c) => c.amount),
        backgroundColor: activeCategories.map((c) => CATEGORY_METADATA[c.category]?.chartColor || '#94A3B8'),
        borderColor: '#0B0F19',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#94A3B8',
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 3,
          usePointStyle: true,
          font: {
            size: 11,
            family: "'Plus Jakarta Sans', sans-serif",
          },
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#151E32',
        titleColor: '#F8FAFC',
        bodyColor: '#38BDF8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = Math.round((val / total) * 100);
            return ` ${formatINR(val)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div className="h-64 sm:h-72 w-full relative flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};
