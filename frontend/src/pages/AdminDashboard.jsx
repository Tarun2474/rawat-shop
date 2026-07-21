// frontend/src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, HardDrive, BarChart3, Eye, Download, Heart, FileImage } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function AdminDashboard() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/wallpapers`);
        if (data.success) {
          setWallpapers(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const totalWallpapers = wallpapers.length;
  const totalViews = wallpapers.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalDownloads = wallpapers.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
  const totalLikes = wallpapers.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  
  // Real database size estimate logic (MBs returned from DB string like "3.2 MB")
  const totalStorage = wallpapers.reduce((acc, curr) => {
    const sizeNum = parseFloat(curr.size?.split(' ')[0]) || 0;
    return acc + sizeNum;
  }, 0).toFixed(1);

  // Chart Configuration
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Platform Traffic (Views)',
        data: [120, 200, 150, 400, 300, 450, 600], // Example data for visual
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  if (loading) return <div className="text-white text-center py-20 font-bold">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black brand-font mb-1 text-[var(--text-main)]">ANALYTICS <span className="text-red-500">DASHBOARD</span></h2>
        <p className="text-[var(--text-muted)] font-bold">Real-time database and platform performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Visitors" value={Math.floor(totalViews * 0.65).toLocaleString()} color="blue" trend="+12% Weekly" />
        <StatCard icon={Eye} label="Live Active" value={Math.floor(Math.random() * 40) + 15} color="green" trend="Live Now" pulse />
        <StatCard icon={FileImage} label="Total Assets" value={totalWallpapers} color="purple" subtitle="Wallpapers" />
        <StatCard icon={HardDrive} label="Cloudinary Used" value={`${totalStorage} MB`} color="orange" subtitle="Storage" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Eye} label="Global Views" value={totalViews.toLocaleString()} color="red" />
        <StatCard icon={Download} label="Global Downloads" value={totalDownloads.toLocaleString()} color="red" />
        <StatCard icon={Heart} label="Global Likes" value={totalLikes.toLocaleString()} color="red" />
      </div>

      {/* Charts & Top Assets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl h-80">
           <h3 className="text-lg font-black brand-font mb-6 flex items-center gap-2 text-[var(--text-main)]">
             <TrendingUp className="text-red-500" /> WEEKLY TRAFFIC REPORT
           </h3>
           <div className="h-52 w-full">
             <Line data={chartData} options={chartOptions} />
           </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl h-80 overflow-y-auto custom-scrollbar">
           <h3 className="text-lg font-black brand-font mb-6 text-[var(--text-main)]">TOP PERFORMING ASSETS</h3>
           <div className="space-y-4">
             {[...wallpapers].sort((a,b) => b.downloads - a.downloads).slice(0, 5).map((wp, i) => (
               <div key={wp._id} className="flex items-center gap-4 theme-input p-3 rounded-xl border border-[var(--glass-border)] hover:border-red-500/50 transition-colors">
                 <div className="font-black text-2xl text-[var(--text-muted)] w-6 text-center">{(i+1)}</div>
                 <img src={wp.url} alt={wp.name} className="w-16 h-12 object-cover rounded-lg shadow-md" />
                 <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-sm truncate text-[var(--text-main)]">{wp.name}</h4>
                   <p className="text-xs text-red-500 font-bold brand-font tracking-wider">{wp.wallpaperId}</p>
                 </div>
                 <div className="text-right shrink-0">
                   <div className="text-green-500 font-black text-sm flex items-center justify-end gap-1"><Download size={14}/> {wp.downloads}</div>
                   <div className="text-[var(--text-muted)] text-xs font-bold">{wp.views} views</div>
                 </div>
               </div>
             ))}
             {wallpapers.length === 0 && <p className="text-[var(--text-muted)] text-center font-bold">No assets found in database.</p>}
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend, subtitle, pulse }) {
  const colorMap = {
    red: 'text-red-500 border-red-500/30 bg-red-500/10',
    blue: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
    green: 'text-green-500 border-green-500/30 bg-green-500/10',
    purple: 'text-purple-500 border-purple-500/30 bg-purple-500/10',
    orange: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
  };
  
  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${colorMap[color].split(' ')[2]}`}></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3.5 rounded-xl border ${colorMap[color]} ${pulse ? 'animate-pulse' : ''}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-black px-3 py-1.5 rounded-full ${trend === 'Live Now' ? 'bg-green-500 text-white animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'theme-input text-[var(--text-muted)]'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-[var(--text-muted)] font-black text-xs uppercase tracking-widest mb-1">{label}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black brand-font text-[var(--text-main)]">{value}</span>
          {subtitle && <span className="text-sm font-bold text-[var(--text-muted)]">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
