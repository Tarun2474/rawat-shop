// frontend/src/pages/AdminUpload.jsx

import React, { useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, CheckSquare, Square, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MAIN_CATEGORIES = ['Latest', 'Premium', 'Mobile Wallpapers', 'Laptop Wallpapers', 'Tablet Wallpapers'];
const DEFAULT_SUB_CATEGORIES = ['Gods', 'Gaming', 'Anime', 'Nature', 'Cars', 'Bikes', 'Technology', 'Superheroes', 'Marvel', 'DC', 'Movies', 'Space', 'Abstract', 'Dark', 'AMOLED', 'Minimal', 'Sports', 'Fantasy', 'Sci-Fi'];

export default function AdminUpload() {
  const [name, setName] = useState('');
  const [selectedMainCategories, setSelectedMainCategories] = useState(['Latest']);
  
  const [subCategories, setSubCategories] = useState(DEFAULT_SUB_CATEGORIES);
  const [category, setCategory] = useState(DEFAULT_SUB_CATEGORIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [resolution, setResolution] = useState('Original 4K');
  const [isCoverFlow, setIsCoverFlow] = useState(false); 
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Cloudinary credentials
  const CLOUD_NAME = "mluvitu1";
  const UPLOAD_PRESET = "upload_shop_unsigned";

  // Helper function to safely get token from anywhere it might be stored
  const getAuthToken = () => {
    return sessionStorage.getItem('adminToken') || 
           sessionStorage.getItem('token') || 
           localStorage.getItem('adminToken') || 
           localStorage.getItem('token');
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchSubCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/subcategories`);
        if (data.success) {
          const dbCatNames = data.data.map(c => c.name);
          const merged = Array.from(new Set([...DEFAULT_SUB_CATEGORIES, ...dbCatNames])).sort((a, b) => a.localeCompare(b));
          setSubCategories(merged);
          if (merged.length > 0) {
            setCategory(merged[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sub-categories", err);
      }
    };
    fetchSubCategories();
  }, [API_URL, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      if (!name) setName(file.name.split('.')[0].replace(/[-_]/g, ' '));
    }
  };

  const toggleMainCategory = (cat) => {
    if (selectedMainCategories.includes(cat)) {
      if (selectedMainCategories.length > 1) {
        setSelectedMainCategories(selectedMainCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedMainCategories([...selectedMainCategories, cat]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const token = getAuthToken();
    if (!token) {
      setError('Session expired or token missing! Please re-login.');
      return;
    }

    if (!imageFile || !name) {
      setError('Please provide a name and select an image.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError('');

    try {
      // Step 1: Upload to Cloudinary directly from browser
      const dataForm = new FormData();
      dataForm.append('file', imageFile);
      dataForm.append('upload_preset', UPLOAD_PRESET);

      setUploadProgress(30);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        dataForm,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(30 + (progressEvent.loaded * 50) / progressEvent.total);
            setUploadProgress(percentCompleted < 85 ? percentCompleted : 85);
          }
        }
      );

      const imageUrl = cloudinaryRes.data.secure_url;
      const imagePublicId = cloudinaryRes.data.public_id; // 🌟 Yeh raha public_id jo Cloudinary deta hai
      setUploadProgress(90);

      // Step 2: Send to backend database with url and publicId
      const payload = {
        name,
        mainCategory: JSON.stringify(selectedMainCategories),
        category,
        resolution,
        isCoverFlow,
        url: imageUrl,
        publicId: imagePublicId // 🌟 Isko yahan bhej diya
      };
      
      await axios.post(`${API_URL}/wallpapers`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setUploadProgress(100);
      navigate('/admin/manage');

    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Unauthorized (401): Admin token is invalid or expired. Please re-login.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to upload wallpaper');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black brand-font mb-1 text-[var(--text-main)]">UPLOAD <span className="text-red-500">ASSET</span></h2>
        <p className="text-[var(--text-muted)] font-bold">Publish high-resolution wallpapers directly to Cloudinary (No size limits).</p>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-[var(--glass-border)] shadow-xl">
        {error && <div className="mb-6 p-4 bg-red-900/20 text-red-500 font-bold border border-red-500 rounded-xl">{error}</div>}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Image Drag/Drop Preview */}
            <div className="flex flex-col gap-4">
              <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider">Wallpaper File (Any Size)</label>
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
                    <p className="text-sm font-bold text-[var(--text-muted)] mb-4 text-center px-4">Upload original 4K JPG, PNG, WEBP (8MB, 10MB+ supported).</p>
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

              {/* Multiple Main Categories (Checkboxes) */}
              <div>
                <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Main Categories (Select Multiple)</label>
                <div className="grid grid-cols-2 gap-2 glass p-3 rounded-xl border border-[var(--glass-border)] max-h-40 overflow-y-auto">
                  {MAIN_CATEGORIES.map(c => {
                    const isSelected = selectedMainCategories.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleMainCategory(c)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                          isSelected 
                            ? 'bg-red-600 text-white shadow-sm' 
                            : 'theme-input text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                        <span className="truncate">{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM THEME-MATCHED SUB-CATEGORY DROPDOWN */}
              <div className="relative">
                <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Sub Category (Dynamic & Alphabetical)</label>
                
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full theme-input rounded-xl py-3.5 px-4 flex items-center justify-between cursor-pointer border border-[var(--glass-border)] hover:border-red-500/50 transition-all font-bold"
                >
                  <span className="text-[var(--text-main)]">{category || 'Select Sub Category'}</span>
                  <ChevronDown size={18} className={`text-[var(--text-muted)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto glass-card rounded-xl border border-[var(--glass-border)] shadow-2xl p-2 space-y-1 bg-neutral-900/95 backdrop-blur-xl">
                    {subCategories.map(c => (
                      <div
                        key={c}
                        onClick={() => {
                          setCategory(c);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          category === c 
                            ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' 
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-neutral-800/50'
                        }`}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Resolution Tag</label>
                <input type="text" value={resolution} onChange={e => setResolution(e.target.value)} required
                  className="w-full theme-input rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-500 transition-all font-bold"
                  placeholder="e.g. Original 4K, 1080p" />
              </div>

              {/* Add to Cover Flow Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCoverFlow(!isCoverFlow)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all border cursor-pointer w-full ${
                    isCoverFlow 
                      ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                      : 'theme-input text-[var(--text-muted)] border-[var(--glass-border)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {isCoverFlow ? <CheckSquare size={18} /> : <Square size={18} />}
                  <span className="uppercase tracking-wider">Add to Homepage Cover Flow Carousel</span>
                </button>
              </div>

            </div>
          </div>

          {/* Upload Button with Live Progress Animation & Percentage */}
          <div className="space-y-2">
            <button type="submit" disabled={isUploading || !imageFile}
              className="w-full py-4.5 rounded-xl font-black uppercase tracking-widest transition-all mt-4 brand-font text-lg flex justify-center items-center gap-3 bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              <UploadCloud size={24} /> 
              {isUploading ? `UPLOADING TO CLOUD... ${uploadProgress}%` : 'PUBLISH WALLPAPER'}
            </button>

            {/* Live Progress Bar Animation */}
            {isUploading && (
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden border border-neutral-700">
                <div 
                  className="bg-red-600 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.8)]" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}