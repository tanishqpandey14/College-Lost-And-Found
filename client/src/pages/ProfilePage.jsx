import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Mail, Phone, Edit, X, Check, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(user);
  
  // Stats state
  const [stats, setStats] = useState({ lostCount: 0, foundCount: 0, returnCount: 0 });

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setFormData({ name: user.name || '', phoneNumber: user.phoneNumber || '' });
    }
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const [lostRes, foundRes] = await Promise.all([
        API.get('/lost-items'),
        API.get('/found-items')
      ]);

      const userId = user?.id || user?._id;
      const myLost = (lostRes.data.items || []).filter(i => (i.owner?._id || i.owner) === userId);
      const myFound = (foundRes.data.items || []).filter(i => (i.finder?._id || i.finder) === userId);
      const myReturns = [...myLost, ...myFound].filter(i => i.status === 'Returned');

      setStats({
        lostCount: myLost.length,
        foundCount: myFound.length,
        returnCount: myReturns.length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleOpenEdit = () => {
    setError('');
    setSuccessMsg('');
    setFormData({ name: currentUser?.name || '', phoneNumber: currentUser?.phoneNumber || '' });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const res = await API.put('/auth/update', formData);
      setCurrentUser(res.data.user);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setIsEditing(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'TP';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-8 shadow-sm">
        
        {/* Profile Header */}
        <div className="relative pt-4 pb-2">
          <div className="w-20 h-20 rounded-2xl bg-[#000B76] text-white flex items-center justify-center font-bold text-2xl shadow-md mb-4">
            {initials}
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
                {currentUser.name}
              </h1>
            </div>

            <button
              onClick={handleOpenEdit}
              className="px-4 py-2 rounded-full border border-[#E2D9C8] text-xs font-semibold text-[#1A1A1A] hover:bg-[#EFE9DD] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div className="bg-[#EFE9DD] p-4 rounded-2xl border border-[#E2D9C8] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#000B76]/10 text-[#000B76] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-[#666666] uppercase">EMAIL</span>
              <span className="text-xs font-semibold text-[#1A1A1A] truncate block max-w-45">
                {currentUser.email}
              </span>
            </div>
          </div>

          <div className="bg-[#EFE9DD] p-4 rounded-2xl border border-[#E2D9C8] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#000B76]/10 text-[#000B76] flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-[#666666] uppercase">PHONE</span>
              <span className="text-xs font-semibold text-[#1A1A1A]">
                {currentUser.phoneNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E2D9C8]">
          <div className="bg-[#EFE9DD] p-4 rounded-2xl border border-[#E2D9C8] text-center">
            <span className="block text-[10px] font-bold text-[#666666] uppercase">LOST REPORTS</span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1 block">{stats.lostCount}</span>
          </div>

          <div className="bg-[#EFE9DD] p-4 rounded-2xl border border-[#E2D9C8] text-center">
            <span className="block text-[10px] font-bold text-[#666666] uppercase">FOUND REPORTS</span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1 block">{stats.foundCount}</span>
          </div>

          <div className="bg-[#EFE9DD] p-4 rounded-2xl border border-[#E2D9C8] text-center">
            <span className="block text-[10px] font-bold text-[#666666] uppercase">RETURNS</span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1 block">{stats.returnCount}</span>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-xl">
            
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-[#666666] hover:text-[#1A1A1A] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#C90035]/10 border border-[#C90035]/20 text-[#C90035] text-xs text-center font-medium">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-[#007A55]/10 border border-[#007A55]/20 text-[#007A55] text-xs text-center font-medium flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#1A1A1A] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-xs font-semibold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#1A1A1A] mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-xs font-semibold text-[#1A1A1A]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3.5 rounded-full bg-[#000B76] text-white font-bold text-xs shadow-md hover:bg-[#000B76]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3.5 rounded-full bg-[#E2D9C8] text-[#1A1A1A] font-bold text-xs hover:bg-[#DCD3C3] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}