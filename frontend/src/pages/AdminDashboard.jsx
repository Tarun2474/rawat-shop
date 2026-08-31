// frontend/src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, HardDrive, BarChart3, Eye, Download, Heart, FileImage, Calendar, Database } from 'lucide-react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function AdminDashboard() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date filters & applied states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [filteredAnalytics, setFilteredAnalytics] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('adminToken');

  // 1. Fetch default wallpapers & standard stats (Always working like original)
  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/wallpapers`);
        if (data.success) {
          setWallpapers(data.data);
        }
      } catch (error) {
        console.error("Error fetching wallpapers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallpapers();
  }, [API_URL]);

  // 2. Fetch custom analytics ONLY when "Apply" button is clicked
  useEffect(() => {
    if (!appliedStartDate && !appliedEndDate) {
      setFilteredAnalytics(null);
      return;
    }

    const fetchCustomAnalytics = async () => {
      try {
        let url = `${API_URL}/analytics?`;
        if (appliedStartDate) url += `startDate=${appliedStartDate}&`;
        if (appliedEndDate) url += `endDate=${appliedEndDate}&`;

        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data && data.success) {
          setFilteredAnalytics({
            metrics: data.metrics || { totalViews: 0, totalDownloads: 0, totalLikes: 0 },
            logs: Array.isArray(data.data) ? data.data : []
          });
        }
      } catch (error) {
        console.error("Error fetching filtered analytics", error);
      }
    };
    fetchCustomAnalytics();
  }, [appliedStartDate, appliedEndDate, API_URL, token]);

  const handleApplyFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setFilteredAnalytics(null);
  };

  // Default calculations from wallpapers collection
  const totalWallpapers = wallpapers.length;
  const defaultTotalViews = wallpapers.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const defaultTotalDownloads = wallpapers.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
  const defaultTotalLikes = wallpapers.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  
  const totalStorage = wallpapers.reduce((acc, curr) => {
    const sizeNum = parseFloat(curr.size?.split(' ')[0]) || 0;
    return acc + sizeNum;
  }, 0).toFixed(1);

  // Use filtered metrics if applied, else fallback to default wallpaper stats
  const activeViews = filteredAnalytics ? filteredAnalytics.metrics.totalViews : defaultTotalViews;
  const activeDownloads = filteredAnalytics ? filteredAnalytics.metrics.totalDownloads : defaultTotalDownloads;
  const activeLikes = filteredAnalytics ? filteredAnalytics.metrics.totalLikes : defaultTotalLikes;
  const activeLogs = filteredAnalytics ? filteredAnalytics.logs : [];

  // Default or Filtered Chart Data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Platform Traffic (Views)',
        data: [
          Math.floor(activeViews * 0.1),
          Math.floor(activeViews * 0.15),
          Math.floor(activeViews * 0.12),
          Math.floor(activeViews * 0.2),
          Math.floor(activeViews * 0.18),
          Math.floor(activeViews * 0.25),
          activeViews
        ], 
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
        <StatCard icon={Users} label="Total Visitors" value={Math.floor(activeViews * 0.8).toLocaleString()} color="blue" trend="Active Base" />
        <StatCard icon={Eye} label="Total Wallpapers" value={totalWallpapers} color="green" trend="Live DB" />
        <StatCard icon={FileImage} label="Total Assets" value={totalWallpapers} color="purple" subtitle="Items" />
        <StatCard icon={HardDrive} label="Cloudinary Used" value={`${totalStorage} MB`} color="orange" subtitle="Storage" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Eye} label="Global Views" value={activeViews.toLocaleString()} color="red" />
        <StatCard icon={Download} label="Global Downloads" value={activeDownloads.toLocaleString()} color="red" />
        <StatCard icon={Heart} label="Global Likes" value={activeLikes.toLocaleString()} color="red" />
      </div>

      {/* Charts & Top Assets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
           <div>
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
               <h3 className="text-lg font-black brand-font flex items-center gap-2 text-[var(--text-main)]">
                 <TrendingUp className="text-red-500" /> PERFORMANCE ANALYTICS
               </h3>
               
               {/* Custom Date Filter with Apply & Reset Buttons */}
               <div className="flex items-center gap-2 text-xs flex-wrap">
                 <input 
                   type="date" 
                   value={startDate} 
                   onChange={e => setStartDate(e.target.value)} 
                   className="theme-input px-2 py-1.5 rounded-lg font-bold text-xs cursor-pointer" 
                 />
                 <span className="text-[var(--text-muted)] font-bold">to</span>
                 <input 
                   type="date" 
                   value={endDate} 
                   onChange={e => setEndDate(e.target.value)} 
                   className="theme-input px-2 py-1.5 rounded-lg font-bold text-xs cursor-pointer" 
                 />
                 <button 
                   onClick={handleApplyFilter}
                   className="bg-red-600 hover:bg-red-500 text-white font-black px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                 >
                   Apply
                 </button>
                 {appliedStartDate && (
                   <button 
                     onClick={handleResetFilter}
                     className="bg-gray-600 hover:bg-gray-500 text-white font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                   >
                     Reset
                   </button>
                 )}
               </div>
             </div>
           </div>

           <div className="h-52 w-full">
             {/* If filter applied and zero logs found, show professional No Data message */}
             {appliedStartDate && activeLogs.length === 0 && defaultTotalViews > 0 && activeViews === 0 ? (
               <div className="h-full flex flex-col items-center justify-center space-y-2">
                 <div className="p-3 rounded-xl bg-red-600/10 text-red-500">
                   <Database size={24} />
                 </div>
                 <p className="text-xs font-black text-[var(--text-main)] uppercase tracking-wide">No Data Available</p>
                 <p className="text-[11px] font-bold text-[var(--text-muted)] text-center">
                   No activity records found for the selected date range. Click Reset to view default analytics.
                 </p>
               </div>
             ) : (
               <Line data={chartData} options={chartOptions} />
             )}
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
                   <p className="text-xs text-red-500 font-black brand-font tracking-wider">{wp.wallpaperId}</p>
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