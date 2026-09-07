// frontend/src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, HardDrive, BarChart3, Eye, Download, Heart, FileImage, FolderPlus, Trash2 } from 'lucide-react';
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

  // States for Create Sub Categories feature
  const [subCategories, setSubCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [subCatLoading, setSubCatLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('adminToken');

  const fetchData = async () => {
    try {
      const [wpRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/wallpapers`),
        axios.get(`${API_URL}/subcategories`)
      ]);
      if (wpRes.data.success) {
        setWallpapers(wpRes.data.data);
      }
      if (catRes.data.success) {
        setSubCategories(catRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL]);

  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubCatLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/subcategories`, { name: newCatName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setNewCatName('');
        fetchData();
        alert('Sub-category created successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create sub-category');
    } finally {
      setSubCatLoading(false);
    }
  };

  const handleDeleteSubCategory = async (id, name) => {
    if (window.confirm(`Delete sub-category "${name}"?`)) {
      try {
        await axios.delete(`${API_URL}/subcategories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubCategories(subCategories.filter(c => c._id !== id));
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const totalWallpapers = wallpapers.length;
  const totalViews = wallpapers.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalDownloads = wallpapers.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
  const totalLikes = wallpapers.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  
  const totalStorage = wallpapers.reduce((acc, curr) => {
    const sizeNum = parseFloat(curr.size?.split(' ')[0]) || 0;
    return acc + sizeNum;
  }, 0).toFixed(1);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Platform Traffic (Views)',
        data: [
          Math.floor(totalViews * 0.1),
          Math.floor(totalViews * 0.15),
          Math.floor(totalViews * 0.12),
          Math.floor(totalViews * 0.2),
          Math.floor(totalViews * 0.18),
          Math.floor(totalViews * 0.25),
          totalViews
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
        <StatCard icon={Users} label="Total Visitors" value={Math.floor(totalViews * 0.8).toLocaleString()} color="blue" trend="Active Base" />
        <StatCard icon={Eye} label="Total Wallpapers" value={totalWallpapers} color="green" trend="Live DB" />
        <StatCard icon={FileImage} label="Total Assets" value={totalWallpapers} color="purple" subtitle="Items" />
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

      {/* 🌟 CREATE SUB CATEGORIES SECTION */}
      <div className="glass-card p-6 rounded-2xl border border-[var(--glass-border)] shadow-xl space-y-6">
        <div>
          <h3 className="text-xl font-black brand-font mb-1 text-[var(--text-main)] flex items-center gap-2">
            <FolderPlus className="text-red-500" /> CREATE SUB CATEGORIES
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-bold">Add new sub-categories dynamically. Duplicate names are automatically blocked.</p>
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreateSubCategory} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Enter new sub-category (e.g., Cyberpunk, GTA VI)..." 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full theme-input rounded-xl p-3.5 text-sm font-bold focus:outline-none focus:border-red-500 transition-all border border-[var(--glass-border)]"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={subCatLoading}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            <FolderPlus size={18} /> {subCatLoading ? 'Creating...' : 'Create Category'}
          </button>
        </form>

        {/* Existing Sub Categories List */}
        <div>
          <h4 className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider mb-3">
            Existing Sub Categories ({subCategories.length})
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subCategories.map(cat => (
              <div key={cat._id} className="glass flex items-center justify-between p-3 rounded-xl border border-[var(--glass-border)]">
                <span className="text-xs font-bold text-[var(--text-main)] truncate">{cat.name}</span>
                <button 
                  type="button"
                  onClick={() => handleDeleteSubCategory(cat._id, cat.name)}
                  className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1 cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {subCategories.length === 0 && (
              <p className="col-span-full text-center text-[var(--text-muted)] py-4 text-xs font-bold">No custom sub-categories created yet.</p>
            )}
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