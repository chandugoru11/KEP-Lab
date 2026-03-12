import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Thermometer, Droplets, Wind, Zap, AlertCircle } from 'lucide-react';

const mockData = Array.from({ length: 20 }).map((_, i) => ({
  time: i,
  temp: 20 + Math.random() * 5,
  humidity: 40 + Math.random() * 10,
  voltage: 4.8 + Math.random() * 0.4,
}));

export const IoTDashboard: React.FC = () => {
  const { isRunning } = useStore();
  const [data, setData] = useState(mockData);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setData(prev => [
        ...prev.slice(1),
        {
          time: prev[prev.length - 1].time + 1,
          temp: 20 + Math.random() * 5,
          humidity: 40 + Math.random() * 10,
          voltage: 4.8 + Math.random() * 0.4,
        }
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const stats = [
    { label: 'Temperature', value: '24.2°C', icon: Thermometer, color: 'text-orange-500' },
    { label: 'Humidity', value: '45%', icon: Droplets, color: 'text-blue-500' },
    { label: 'Air Quality', value: 'Good', icon: Wind, color: 'text-emerald-500' },
    { label: 'Power Draw', value: '120mA', icon: Zap, color: 'text-yellow-500' },
  ];

  return (
    <div className="w-full h-full bg-[#0a0a0a] p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">IoT Telemetry Dashboard</h2>
            <p className="text-white/40 text-sm">Real-time sensor data from simulation</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-mono">LIVE STREAMING</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 bg-[#121212] rounded-2xl border border-white/5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Sensor</span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 bg-[#121212] rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight">Temperature History</h3>
              <div className="text-[10px] font-mono text-white/20">UNIT: CELSIUS</div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#f97316' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-8 bg-[#121212] rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight">Voltage Stability</h3>
              <div className="text-[10px] font-mono text-white/20">UNIT: VOLTS</div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[4, 6]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Line type="monotone" dataKey="voltage" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 flex items-center gap-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-red-500">System Alert</div>
            <div className="text-xs text-red-500/60">High current draw detected on Pin 7. Check for potential short circuit.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
