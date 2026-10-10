import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MasterDashboardSummary } from '../../types/loan';
import { formatCompactINR, formatINR } from '../../utils/formatters';

interface LoanComparisonChartProps {
  summary: MasterDashboardSummary;
}

export const LoanComparisonChart: React.FC<LoanComparisonChartProps> = ({ summary }) => {
  const chartData = summary.loanSummaries.map((s) => ({
    name: s.loan.name,
    outstanding: Math.round(s.currentOutstandingPrincipal),
    repaid: Math.round(s.principalRepaid),
  }));

  return (
    <div className="card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Portfolio Breakdown by Loan</h3>
          <p className="chart-subtitle">Outstanding balance vs repaid principal</p>
        </div>
      </div>

      <div style={{ height: 260, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
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
              formatter={(val: any, name: any) => [
                formatINR(Number(val)),
                name === 'outstanding' ? 'Outstanding' : 'Repaid',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              formatter={(val) => (val === 'outstanding' ? 'Outstanding Principal' : 'Principal Repaid')}
            />
            <Bar dataKey="repaid" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="outstanding" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
