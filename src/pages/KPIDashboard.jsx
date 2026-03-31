import React from 'react';
import { Target, TrendingUp, TrendingDown, Users, DollarSign, Award, Clock, FileText, CheckCircle } from 'lucide-react';
import { useData } from '../hooks/useData';

export default function KPIDashboard() {
  const { bids, tenders } = useData();

  // Calculate KPIs
  const totalBids = bids.length;
  const wonBids = bids.filter(b => b.result === 'Won').length;
  const winRate = totalBids > 0 ? ((wonBids / totalBids) * 100).toFixed(1) : 0;
  
  const totalValue = bids.reduce((sum, b) => sum + (b.bid_amount || 0), 0);
  const wonValue = bids.filter(b => b.result === 'Won').reduce((sum, b) => sum + (b.bid_amount || 0), 0);
  
  const avgBidValue = totalBids > 0 ? totalValue / totalBids : 0;
  const avgWonValue = wonBids > 0 ? wonValue / wonBids : 0;
  
  const pendingBids = bids.filter(b => !b.result || b.result === 'Pending').length;
  const submittedBids = bids.filter(b => b.status === 'Submitted').length;
  
  // Calculate trends (mock data for demo)
  const trends = {
    winRate: +5.2,
    totalValue: +12.8,
    avgBidValue: -2.1,
    responseTime: -8.5,
  };

  const kpiCards = [
    { title: 'Win Rate', value: `${winRate}%`, target: '35%', trend: trends.winRate, icon: Target, color: 'blue' },
    { title: 'Total Bid Value', value: `MVR ${(totalValue / 1000000).toFixed(1)}M`, target: 'MVR 50M', trend: trends.totalValue, icon: DollarSign, color: 'emerald' },
    { title: 'Avg Won Value', value: `MVR ${(avgWonValue / 1000).toFixed(0)}K`, target: 'MVR 500K', trend: trends.avgBidValue, icon: Award, color: 'purple' },
    { title: 'Response Time', value: '4.2 days', target: '5 days', trend: trends.responseTime, icon: Clock, color: 'amber' },
  ];

  const secondaryMetrics = [
    { label: 'Total Bids', value: totalBids, icon: FileText },
    { label: 'Won Bids', value: wonBids, icon: CheckCircle },
    { label: 'Pending', value: pendingBids, icon: Clock },
    { label: 'Submitted', value: submittedBids, icon: TrendingUp },
  ];

  const getTrendIcon = (trend) => {
    return trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = (trend) => {
    return trend > 0 ? 'text-emerald-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KPI Dashboard</h1>
        <p className="text-gray-500 mt-1">Key performance indicators and metrics</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const colors = {
            blue: 'from-blue-50 to-blue-100 text-blue-700',
            emerald: 'from-emerald-50 to-emerald-100 text-emerald-700',
            purple: 'from-purple-50 to-purple-100 text-purple-700',
            amber: 'from-amber-50 to-amber-100 text-amber-700',
          };
          
          return (
            <div key={index} className={`card bg-gradient-to-br ${colors[kpi.color]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-gray-500 mt-1">Target: {kpi.target}</p>
                </div>
                <div className={`p-3 bg-white/50 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-3 text-sm ${getTrendColor(kpi.trend)}`}>
                {getTrendIcon(kpi.trend)}
                <span>{Math.abs(kpi.trend)}% vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Bid Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondaryMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <Icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-500">{metric.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Monthly Performance</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [45, 62, 38, 75, 58, 82];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className="text-xs text-gray-500">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Win/Loss Ratio</h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="20"
                  strokeDasharray={`${winRate * 2.51} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{winRate}%</span>
                <span className="text-sm text-gray-500">Win Rate</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-sm">Won ({wonBids})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full" />
              <span className="text-sm">Lost ({bids.filter(b => b.result === 'Lost').length})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
