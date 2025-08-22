"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartDataPoint } from '@/types';

interface QuantumChartProps {
  data: ChartDataPoint[];
}

const QuantumChart: React.FC<QuantumChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full bg-black/30 p-2 rounded-lg border border-primary/20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
            </linearGradient>
             <linearGradient id="colorVolatility" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
          <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 12 }} orientation="left" />
          <YAxis yAxisId="right" tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 12 }} orientation="right" />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background) / 0.9)', 
              borderColor: 'hsl(var(--primary))',
              color: 'hsl(var(--foreground))'
            }}
            labelStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
            name="Price"
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="momentum" 
            stroke="hsl(var(--chart-2))" 
            fillOpacity={1} 
            fill="url(#colorMomentum)" 
            strokeWidth={1}
            name="Momentum"
          />
           <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="volatility" 
            stroke="hsl(var(--chart-4))" 
            fillOpacity={1} 
            fill="url(#colorVolatility)" 
            strokeWidth={1}
            name="Volatility"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuantumChart;
