import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { ArrowLeft, Lock, ArrowRight, Upload } from 'lucide-react';

export default function ReportLost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Electronics',
    brand: '',
    color: '',
    lostDate: '',
    lostTime: '',
    lostLocation: '',
    description: '',
    hiddenDetails: ''
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      
      files.forEach((file) => {
        data.append('images', file);
      });

      await API.post('/lost-items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit lost report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#000B76] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-6 sm:p-10 shadow-sm">
        
        <div className="mb-8">
          <span className="text-xs font-bold tracking-widest text-[#666666] uppercase">
            STEP 1 · DESCRIBE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">
            Report a Lost Item
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            Provide descriptive characteristics. Jina AI will compute similarity against found reports.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#C90035]/10 border border-[#C90035]/20 text-[#C90035] text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                ITEM NAME<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="text"
                name="itemName"
                required
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Navy Blue Backpack"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                CATEGORY<span className="text-[#C90035]"> *</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              >
                <option value="Electronics">Electronics</option>
                <option value="Wallets & Cards">Wallets & Cards</option>
                <option value="Keys & ID Cards">Keys & ID Cards</option>
                <option value="Bags & Luggage">Bags & Luggage</option>
                <option value="Books & Stationery">Books & Stationery</option>
                <option value="Clothing & Accessories">Clothing & Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                BRAND
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Fossil"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                COLOR<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="text"
                name="color"
                required
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. Blue"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                LOST DATE<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="date"
                name="lostDate"
                required
                value={formData.lostDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                APPROX. TIME
              </label>
              <input
                type="time"
                name="lostTime"
                value={formData.lostTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
              LOST LOCATION<span className="text-[#C90035]"> *</span>
            </label>
            <input
              type="text"
              name="lostLocation"
              required
              value={formData.lostLocation}
              onChange={handleChange}
              placeholder="e.g. Library 2nd Floor Desk"
              className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                PUBLIC DESCRIPTION<span className="text-[#C90035]"> *</span>
              </label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Visible characteristics anyone could describe."
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm resize-none"
              ></textarea>
            </div>

            <div className="bg-[#EAE3D5] p-4 rounded-2xl border border-[#DCD3C3]">
              <div className="flex items-center gap-2 mb-2 text-[#000B76]">
                <Lock className="w-4 h-4" />
                <label className="block text-xs font-bold tracking-wider uppercase">
                  HIDDEN DETAILS<span className="text-[#C90035]"> *</span>
                </label>
              </div>
              <textarea
                name="hiddenDetails"
                rows="3"
                required
                value={formData.hiddenDetails}
                onChange={handleChange}
                placeholder="Private details: serial numbers, wallpaper, contents."
                className="w-full px-4 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E2D9C8]">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-5 py-2.5 rounded-full bg-[#000B76] text-white text-xs font-semibold hover:bg-[#000B76]/90 transition-all inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Choose Files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-[#666666]">
                {files.length > 0 ? `${files.length} file(s) selected` : 'No file chosen'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-full bg-[#000B76] hover:bg-[#000B76]/90 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Report...' : 'Submit Lost Report'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}