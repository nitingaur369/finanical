import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Transaction } from '../../types';
import { formatINR } from '../../utils/formatters';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  transactions: Transaction[];
  yearMonth: string;
}

export const SpendingTrendChart: React.FC<Props> = ({ transactions, yearMonth }) => {
  // Filter for selected month
  const monthTransactions = transactions.filter((t) => t.date.startsWith(yearMonth));

  if (monthTransactions.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-midnight-900/40 border border-white/5">
        <div className="w-12 h-12 rounded-xl bg-midnight-800 text-slate-500 flex items-center justify-center mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-300">No spending activity</p>
        <p className="text-xs text-slate-400 mt-1">Daily trend will chart automatically as you record purchases.</p>
      </div>
    );
  }

  // Get total days in month
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Aggregate spending per day
  const dailySpendMap = new Map<number, number>();
  for (let d = 1; d <= daysInMonth; d++) {
    dailySpendMap.set(d, 0);
  }

  monthTransactions.forEach((t) => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (day && dailySpendMap.has(day)) {
      dailySpendMap.set(day, (dailySpendMap.get(day) || 0) + t.amount);
    }
  });

  // Calculate cumulative trajectory
  let cumulative = 0;
  const labels: string[] = [];
  const cumulativeData: number[] = [];
  const dailyData: number[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dailyVal = dailySpendMap.get(d) || 0;
    cumulative += dailyVal;
    // Show label every few days on mobile or all days
    labels.push(`${d} ${new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'short' })}`);
    cumulativeData.push(cumulative);
    dailyData.push(dailyVal);
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Cumulative Spend',
        data: cumulativeData,
        borderColor: '#14B8A6', // Brand Teal
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(20, 184, 166, 0.35)');
          gradient.addColorStop(1, 'rgba(20, 184, 166, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointBackgroundColor: '#14B8A6',
        pointBorderColor: '#0B0F19',
        pointRadius: 2.5,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151E32',
        titleColor: '#F8FAFC',
        bodyColor: '#38BDF8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` Total to date: ${formatINR(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
        ticks: {
          color: '#64748B',
          maxTicksLimit: 10,
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 10,
          },
          callback: (value: any) => formatINR(value),
        },
      },
    },
  };

  return (
    <div className="h-64 sm:h-72 w-full relative">
      <Line data={data} options={options} />
    </div>
  );
};
