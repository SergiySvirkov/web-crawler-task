import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LinksChartProps {
  internal: number;
  external: number;
}

const LinksChart: React.FC<LinksChartProps> = ({ internal, external }) => {
  const data = [
    { name: 'Internal Links', value: internal },
    { name: 'External Links', value: external },
  ];

  const COLORS = ['#0088FE', '#00C49F']; // Blue for Internal, Green for External

  return (
    // ResponsiveContainer makes the chart adapt to the parent container's size
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LinksChart;
