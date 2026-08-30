// frontend/src/pages/AdminAnalytics.jsx

import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, Eye, Heart, TrendingUp, Mail } from 'lucide-react';
import axios from 'axios';

export default function AdminAnalytics() {
  const [report, setReport] = useState({ metrics: { totalDownloads: 0, totalViews: 0, totalLikes: 0 }, data: [] });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportEmail, setReportEmail] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('adminToken');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/analytics?`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      if (actionFilter) url += `action=${actionFilter}`;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data && data.success) {
        setReport({
          metrics: data.metrics || { totalDownloads: 0, totalViews: 0, totalLikes: 0 },
          data: Array.isArray(data.data) ? data.data : []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved email on load
  const fetchReportEmail = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/analytics/get-email`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setReportEmail(data.email);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchReportEmail();
  }, [startDate, endDate, actionFilter]);

  const handleSaveEmail = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/analytics/update-email`, 
        { email: reportEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) alert("Monthly Report Email Updated Successfully!");
    } catch (err) {
      alert("Failed to update email");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/export-excel`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'RawatShop_Traffic_Report.xlsx';
      link.click();
    } catch (err) {
      alert("Failed to download Excel report");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black brand-font mb-1 text-[var(--text-main)]">WEBSITE <span className="text-red-500">ANALYTICS</span></h2>
          <p className="text-[var(--text-muted)] font-bold">Track real-time traffic, downloads, custom date reports, and Excel exports.</p>
        </div>
        <button 
          onClick={handleDownloadExcel}
          className="bg-green-600 hover:bg-green-500 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.4)] cursor-pointer uppercase text-xs tracking-wider"
        >
          <Download size={18} /> Download Excel Report
        </button>
      </div>

      {/* Dynamic Email Configuration Card */}
      <div className="glass-card p-5 rounded-2xl border border-[var(--glass-border)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-600/10 text-red-500"><Mail size={22} /></div>
          <div>
            <h4 className="text-sm font-black text-[var(--text-main)] uppercase">Monthly Report Gmail Recipient</h4>
            <p className="text-xs text-[var(--text-muted)] font-bold">Automated monthly performance report will be sent to this email address.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input 
            type="email" 
            value={reportEmail} 
            onChange={e => setReportEmail(e.target.value)} 
            placeholder="Enter recipient email..." 
            className="theme-input px-4 py-2.5 rounded-xl text-xs font-bold w-full md:w-72" 
          />
          <button 
            onClick={handleSaveEmail} 
            className="bg-red-600 hover:bg-red-500 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shrink-0"
          >
            Save Email
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-[var(--glass-border)] flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-600/10 text-blue-500"><Eye size={24} /></div>
          <div>
            <p className="text-xs font-black text-[var(--text-muted)] uppercase">Total Views</p>
            <h3 className="text-2xl font-black text-[var(--text-main)]">{report.metrics.totalViews}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--glass-border)] flex items-center gap-4">
          <div className="p-4 rounded-xl bg-green-600/10 text-green-500"><Download size={24} /></div>
          <div>
            <p className="text-xs font-black text-[var(--text-muted)] uppercase">Total Downloads</p>
            <h3 className="text-2xl font-black text-[var(--text-main)]">{report.metrics.totalDownloads}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--glass-border)] flex items-center gap-4">
          <div className="p-4 rounded-xl bg-red-600/10 text-red-500"><Heart size={24} /></div>
          <div>
            <p className="text-xs font-black text-[var(--text-muted)] uppercase">Total Likes</p>
            <h3 className="text-2xl font-black text-[var(--text-main)]">{report.metrics.totalLikes}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-2xl border border-[var(--glass-border)] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase">From:</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="theme-input px-3 py-2 rounded-xl text-xs font-bold" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase">To:</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="theme-input px-3 py-2 rounded-xl text-xs font-bold" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--text-muted)]" />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="theme-input px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer">
            <option value="">All Actions</option>
            <option value="view">Views Only</option>
            <option value="download">Downloads Only</option>
            <option value="like">Likes Only</option>
          </select>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--input-bg)]">
                <th className="p-4 text-xs font-black text-[var(--text-muted)] uppercase">Wallpaper ID</th>
                <th className="p-4 text-xs font-black text-[var(--text-muted)] uppercase">Name</th>
                <th className="p-4 text-xs font-black text-[var(--text-muted)] uppercase">Category</th>
                <th className="p-4 text-xs font-black text-[var(--text-muted)] uppercase">Action</th>
                <th className="p-4 text-xs font-black text-[var(--text-muted)] uppercase text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-[var(--text-main)] font-bold">Loading Analytics...</td></tr>
              ) : report.data && report.data.length > 0 ? (
                report.data.map(log => (
                  <tr key={log._id} className="hover:bg-[var(--input-bg)] transition-colors">
                    <td className="p-4 text-red-500 font-black brand-font text-xs">{log.wallpaperId?.wallpaperId || 'N/A'}</td>
                    <td className="p-4 font-bold text-sm text-[var(--text-main)]">{log.wallpaperId?.name || 'Deleted Asset'}</td>
                    <td className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase">{log.wallpaperId?.category || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-black ${
                        log.action === 'download' ? 'bg-green-600/20 text-green-500 border border-green-500/30' :
                        log.action === 'view' ? 'bg-blue-600/20 text-blue-500 border border-blue-500/30' :
                        'bg-red-600/20 text-red-500 border border-red-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs font-bold text-[var(--text-muted)]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-10 text-center text-[var(--text-muted)] font-bold">No activity logs found for this date range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}