import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
      <div className="text-3xl font-headline text-primary">{value}</div>
      <div className="text-sm text-foreground/80 mt-1">{label}</div>
    </div>
  );
};

export default StatCard;
