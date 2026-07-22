import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Tag, 
  MapPin, 
  User, 
  Calendar, 
  Trash2
} from 'lucide-react';

export default function LostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/lost-items/${id}`);
      setItem(res.data.item || res.data);
    } catch (err) {
      console.error('Error fetching lost item details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFoundRedirect = (e) => {
    e.preventDefault();
    navigate('/report-found', {
      state: {
        linkedLostItemId: item._id,
        prefillCategory: item.category,
        prefillLocation: item.lostLocation || item.location,
        prefillTitle: item.itemName
      }
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lost report?')) return;
    try {
      setDeleting(true);
      await API.delete(`/lost-items/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting lost item:', err);
      alert('Failed to delete report.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#000B76] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-[#666666] font-medium text-sm">Lost item report not found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-[#000B76]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
      </div>
    );
  }

  const currentUserId = String(user?.id || user?._id || '');
  const ownerId = String(item.owner?._id || item.owner || item.reporter?._id || item.reporter || '');
  const isOwner = currentUserId && ownerId && currentUserId === ownerId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#1A1A1A] hover:text-[#000B76] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      {/* Main Card */}
      <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Column: Image */}
        <div className="p-6 bg-[#EFE9DD] flex items-center justify-center relative min-h-75">
          <span className="absolute top-4 left-4 bg-[#C90035] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
            LOST ITEM
          </span>
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0].url || item.images[0]}
              alt={item.itemName}
              className="w-full h-72 object-cover rounded-2xl shadow-sm"
            />
          ) : (
            <div className="w-full h-72 bg-[#E2D9C8] rounded-2xl flex items-center justify-center text-[#888888] text-xs font-bold uppercase tracking-wider">
              No Image Available
            </div>
          )}
        </div>

        {/* Right Column: Details & Action */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
                {item.itemName}
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#C90035]/10 text-[#C90035]">
                {item.status || 'LOST'}
              </span>
            </div>

            <p className="text-xs text-[#666666] leading-relaxed">
              {item.description || 'No detailed description provided.'}
            </p>

            <div className="border-t border-[#E2D9C8] pt-4 space-y-3 text-xs text-[#1A1A1A]">
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-[#000B76] shrink-0" />
                <span className="text-[#666666]">Category:</span>
                <span className="font-bold">{item.category}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#000B76] shrink-0" />
                <span className="text-[#666666]">Location:</span>
                <span className="font-bold">{item.lostLocation || item.location || 'Campus'}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#000B76] shrink-0" />
                <span className="text-[#666666]">Reported by:</span>
                <span className="font-bold">{isOwner ? 'You (Item Owner)' : (item.owner?.name || item.reporter?.name || 'Campus Student')}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#000B76] shrink-0" />
                <span className="text-[#666666]">Reported on:</span>
                <span className="font-bold">
                  {new Date(item.createdAt || item.lostDate).toLocaleDateString()}
                </span>
              </div>
            </div>

          </div>

          {/* Action Footer: Delete button for owner, or Found Report button for others */}
          <div className="border-t border-[#E2D9C8] pt-6">
            {isOwner ? (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#C90035] hover:bg-[#C90035]/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting Report...' : 'Delete Report'}
              </button>
            ) : (
              <button
                onClick={handleFoundRedirect}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#000B76] text-white font-bold text-xs flex items-center justify-center hover:bg-[#000B76]/90 transition-all shadow-md cursor-pointer"
              >
                Found This Item? Report It & Match with AI
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}