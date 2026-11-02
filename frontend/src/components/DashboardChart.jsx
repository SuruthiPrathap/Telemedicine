import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card" style={{ padding: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: '4px 0 0', color: p.color, fontWeight: 'bold' }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300, marginTop: 20 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPres" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="prescriptions" 
            name="Prescriptions"
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorPres)" 
            strokeWidth={3}
          />
          <Area 
            type="monotone" 
            dataKey="records" 
            name="Health Records"
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorRec)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;
