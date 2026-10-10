import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { MasterDashboardSummary } from '../../types/loan';
import { formatCompactINR, formatINR } from '../../utils/formatters';
import { FinancialEngine } from '../../services/financialEngine';

interface DebtTrajectoryChartProps {
  summary: MasterDashboardSummary;
}

export const DebtTrajectoryChart: React.FC<DebtTrajectoryChartProps> = ({ summary }) => {
  // Aggregate monthly remaining balance across all active loans
  const monthMap = new Map<string, number>();

  summary.loanSummaries
    .filter((s) => s.status === 'active')
    .forEach((s) => {
      const schedule = FinancialEngine.generateSchedule(s.loan);
      schedule.forEach((inst) => {
        const ym = inst.date.substring(0, 7); // YYYY-MM
        const currentSum = monthMap.get(ym) ?? 0;
        monthMap.set(ym, currentSum + inst.openingBalance);
      });
    });

  // Sort chronological and sample quarterly or semi-annually if too many points
  const sortedMonths = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  // Sample data points so chart is clean (every 2-3 months)
  const chartData = sortedMonths
    .filter((_, idx) => idx % 3 === 0 || idx === sortedMonths.length - 1)
    .map(([month, balance]) => {
      const [y, m] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        monthKey: month,
        label: `${monthNames[parseInt(m, 10) - 1]} '${y.substring(2)}`,
        balance: Math.round(balance),
      };
    });

  return (
    <div className="card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Forecasted Debt Payoff Trajectory</h3>
          <p className="chart-subtitle">Projected outstanding principal balance over time</p>
        </div>
      </div>

      <div style={{ height: 260, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCompactINR(v)}
            />
            <Tooltip
              formatter={(val: any) => [formatINR(Number(val)), 'Outstanding Balance']}
              labelFormatter={(label) => `Installment: ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                fontSize: 12.5,
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#debtGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
