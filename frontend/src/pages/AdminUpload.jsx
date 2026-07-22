// frontend/src/pages/AdminUpload.jsx

import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MAIN_CATEGORIES = ['Latest', 'Premium', 'Mobile Wallpapers', 'Laptop Wallpapers', 'Tablet Wallpapers'];
const SUB_CATEGORIES = ['Gaming', 'Anime', 'Nature', 'Cars', 'Bikes', 'Technology', 'Superheroes', 'Marvel', 'DC', 'Movies', 'Space', 'Abstract', 'Dark', 'AMOLED', 'Minimal', 'Sports', 'Fantasy', 'Sci-Fi'];

export default function AdminUpload() {
  const [name, setName] = useState('');
  const [mainCategory, setMainCategory] = useState(MAIN_CATEGORIES[0]);
  const [category, setCategory] = useState(SUB_CATEGORIES[0]);
  const [resolution, setResolution] = useState('Original 4K');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('adminToken');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      // Auto-fill name based on filename if empty
      if (!name) setName(file.name.split('.')[0].replace(/[-_]/g, ' '));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile || !name) {
      setError('Please provide a name and select an image.');
      return;
    }

    setIsUploading(true);
    setError('');

    // FormData is required for sending files
    const formData = new FormData();
    formData.append('name', name);
    formData.append('mainCategory', mainCategory);
    formData.append('category', category);
    formData.append('resolution', resolution);
    formData.append('image', imageFile);

    try {
      const { data } = await axios.post(`${API_URL}/wallpapers`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        navigate('/admin/manage');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload wallpaper');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black brand-font mb-1 text-[var(--text-main)]">UPLOAD <span className="text-red-500">ASSET</span></h2>
        <p className="text-[var(--text-muted)] font-bold">Publish high-resolution wallpapers to MongoDB & Cloudinary.</p>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-[var(--glass-border)] shadow-xl">
        {error && <div className="mb-6 p-4 bg-red-900/20 text-red-500 font-bold border border-red-500 rounded-xl">{error}</div>}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Image Drag/Drop Preview */}
            <div className="flex flex-col gap-4">
              <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider">Wallpaper File</label>
              <div className={`flex-1 min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${preview ? 'border-red-500 bg-red-900/10' : 'border-[var(--glass-border)] theme-input hover:border-red-500/50'}`}>
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                       <label className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                         Change Image
                         <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                       </label>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon size={48} className="text-[var(--text-muted)] mb-4" />
                    <p className="text-sm font-bold text-[var(--text-muted)] mb-4 text-center px-4">Upload original JPG, PNG, WEBP. Zero compression applied.</p>
                    <label className="bg-red-600/10 text-red-500 border border-red-500/50 px-6 py-2 rounded-full font-black uppercase tracking-widest cursor-pointer hover:bg-red-600 hover:text-white transition-all">
                      Browse Files
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Metadata Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Wallpaper Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full theme-input rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-500 transition-all font-bold"
                  placeholder="e.g. Cyberpunk City Night" />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Main Category (Menu)</label>
                <select value={mainCategory} onChange={e => setMainCategory(e.target.value)}
                  className="w-full theme-input rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-500 transition-all font-bold appearance-none">
                  {MAIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Sub Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full theme-input rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-500 transition-all font-bold appearance-none">
                  {SUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Resolution Tag</label>
                <input type="text" value={resolution} onChange={e => setResolution(e.target.value)} required
                  className="w-full theme-input rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-500 transition-all font-bold"
                  placeholder="e.g. Original 4K, 1080p" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isUploading || !imageFile}
            className="w-full py-4.5 rounded-xl font-black uppercase tracking-widest transition-all mt-8 brand-font text-lg flex justify-center items-center gap-3 bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <UploadCloud size={24} /> {isUploading ? 'UPLOADING TO CLOUD & DB...' : 'PUBLISH WALLPAPER'}
          </button>
        </form>
      </div>
    </div>
  );
}
