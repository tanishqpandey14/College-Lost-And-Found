import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../../services/api';
import { ArrowLeft, Plus, Trash2, ArrowRight, Upload } from 'lucide-react';

export default function ReportFound() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract linked lost item state passed from LostDetails page silently in the background
  const linkedState = location.state || {};
  const linkedLostItemId = linkedState.linkedLostItemId || null;

  const [formData, setFormData] = useState({
    itemName: linkedState.prefillTitle ? `Found: ${linkedState.prefillTitle}` : '',
    category: linkedState.prefillCategory || 'Electronics',
    brand: '',
    color: '',
    foundDate: new Date().toISOString().split('T')[0],
    foundTime: '12:00',
    foundLocation: linkedState.prefillLocation || '',
    description: ''
  });

  const [verificationQuestions, setVerificationQuestions] = useState(['']);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...verificationQuestions];
    updated[index] = value;
    setVerificationQuestions(updated);
  };

  const addQuestion = () => {
    setVerificationQuestions([...verificationQuestions, '']);
  };

  const removeQuestion = (index) => {
    setVerificationQuestions(verificationQuestions.filter((_, i) => i !== index));
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

      // Background submission of linked lost item ID for AI vector matching
      if (linkedLostItemId) {
        data.append('lostItemId', linkedLostItemId);
      }

      const formattedQuestions = verificationQuestions
        .filter((q) => q.trim() !== '')
        .map((q) => ({ questionText: q }));

      data.append('verificationQuestions', JSON.stringify(formattedQuestions));

      files.forEach((file) => {
        data.append('images', file);
      });

      await API.post('/found-items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/claims');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit found report');
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
            STEP 1 · POST
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">
            Report a Found Item
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            Keep public information brief. Add verification questions so the real owner can prove ownership.
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
                ITEM TITLE<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="text"
                name="itemName"
                required
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Found Black Wallet"
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
                placeholder="e.g. Black"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                FOUND DATE<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="date"
                name="foundDate"
                required
                value={formData.foundDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                LOCATION<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="text"
                name="foundLocation"
                required
                value={formData.foundLocation}
                onChange={handleChange}
                placeholder="e.g. Library Desk"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
              PUBLIC DESCRIPTION<span className="text-[#C90035]"> *</span>
            </label>
            <textarea
              name="description"
              rows="3"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Do not reveal secret details here..."
              className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm resize-none"
            ></textarea>
          </div>

          <div className="bg-[#EAE3D5] p-5 rounded-2xl border border-[#DCD3C3] space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">
                CUSTOM VERIFICATION QUESTIONS
              </label>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1.5 rounded-full bg-[#000B76] text-white text-xs font-semibold hover:bg-[#000B76]/90 transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Question
              </button>
            </div>

            {verificationQuestions.map((q, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder="e.g. what is written inside?"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
                />
                {verificationQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="p-2 text-[#C90035] hover:bg-[#C90035]/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
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
              className="px-8 py-3.5 rounded-full bg-[#000B76] hover:bg-[#000B76]/90 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Publishing Report...' : 'Publish Found Report'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}