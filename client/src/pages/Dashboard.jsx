import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Calendar, PlusCircle, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'LOST', 'FOUND'
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [lostRes, foundRes, matchRes] = await Promise.all([
        API.get('/lost-items'),
        API.get('/found-items'),
        API.get('/matches').catch(() => ({ data: { matches: [] } }))
      ]);

      setLostItems(lostRes.data.items || []);
      setFoundItems(foundRes.data.items || []);
      setMatches(matchRes.data.matches || []);
    } catch (error) {
      console.error('Error fetching dashboard feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine reports for feed display
  const allReports = [
    ...lostItems.map(item => ({ ...item, reportType: 'LOST' })),
    ...foundItems.map(item => ({ ...item, reportType: 'FOUND' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredReports = allReports.filter(item => {
    if (activeTab === 'LOST') return item.reportType === 'LOST';
    if (activeTab === 'FOUND') return item.reportType === 'FOUND';
    return true;
  });

  const currentUserId = String(user?.id || user?._id || '');

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* 1. Hero Campus Banner Container */}
      <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#E5DEC9] text-[#000B76] text-xs font-bold tracking-widest uppercase mb-3">
            CAMPUS RECOVERY BOARD
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            Lost or Found Something on Campus?
          </h1>
          <p className="text-sm text-[#666666] mt-2 max-w-2xl">
            Browse authentic lost and found reports submitted by students & faculty.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link
            to="/lost-item/new"
            className="flex-1 md:flex-none px-6 py-3.5 rounded-full bg-[#C90035] hover:bg-[#C90035]/90 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Report Lost Item
          </Link>
          <Link
            to="/report-found"
            className="flex-1 md:flex-none px-6 py-3.5 rounded-full bg-[#000B76] hover:bg-[#000B76]/90 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            Report Found Item
          </Link>
        </div>
      </div>

      {/* 2. AI Semantic Match Alerts */}
      {matches.length > 0 && (
        <div className="bg-[#EAE3D5] border border-[#DCD3C3] rounded-3xl p-6">
          <div className="flex items-center gap-2 text-[#000B76] font-bold text-sm uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 fill-current" />
            AI Matches ({matches.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <div key={match._id} className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#E8E1D5] flex items-center justify-between gap-4">
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#007A55]/10 text-[#007A55] text-xs font-bold mb-1">
                    {match.confidenceScore}% Match Confidence
                  </div>
                  <h4 className="font-bold text-[#1A1A1A] text-base">{match.lostItem?.itemName} ↔ {match.foundItem?.itemName}</h4>
                  <p className="text-xs text-[#666666] mt-1">Location: {match.foundItem?.foundLocation}</p>
                </div>
                <Link
                  to={`/found-item/${match.foundItem?._id}`}
                  className="px-4 py-2 rounded-full bg-[#000B76] text-white text-xs font-semibold hover:bg-[#000B76]/90 transition-all shrink-0 cursor-pointer"
                >
                  Inspect Match
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Controls Bar (Tabs Only) */}
      <div className="flex items-center justify-start">
        <div className="bg-[#F4EFE6] p-1.5 rounded-full border border-[#E8E1D5] inline-flex items-center">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#000B76] text-white shadow-sm'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            All Reports ({allReports.length})
          </button>
          <button
            onClick={() => setActiveTab('LOST')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'LOST'
                ? 'bg-[#C90035] text-white shadow-sm'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            Lost Items ({lostItems.length})
          </button>
          <button
            onClick={() => setActiveTab('FOUND')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'FOUND'
                ? 'bg-[#007A55] text-white shadow-sm'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            Found Items ({foundItems.length})
          </button>
        </div>
      </div>

      {/* 4. Report Items Feed */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#000B76] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Loading campus reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-[#F4EFE6] rounded-3xl p-12 text-center border border-[#E8E1D5]">
          <p className="text-[#666666] font-medium text-sm">No lost or found reports available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((item) => {
            const isLost = item.reportType === 'LOST';
            const location = isLost ? item.lostLocation : item.foundLocation;
            const itemDate = isLost ? (item.createdAt || item.lostDate) : (item.createdAt || item.foundDate);
            const imageUrl = item.images && item.images.length > 0 
              ? (item.images[0].url || item.images[0])
              : 'https://via.placeholder.com/400x250?text=No+Image+Uploaded';

            // Extract owner / finder / reporter ID
            const ownerId = String(
              item.owner?._id || item.owner || item.finder?._id || item.finder || item.reporter?._id || item.reporter || ''
            );

            // Check if logged in user created this report
            const isMine = Boolean(currentUserId && ownerId && currentUserId === ownerId);

            return (
              <div
                key={item._id}
                className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#DCD3C3] transition-all"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-52 bg-[#EAE3D5] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Badges */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm ${
                        isLost ? 'bg-[#C90035]' : 'bg-[#007A55]'
                      }`}>
                        {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
                      </span>
                    </div>

                    {/* OWNER BADGE: Rendered only if logged in user is the creator */}
                    {isMine && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#000B76] text-white shadow-md flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-amber-300" />
                          Your Report
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] truncate">
                      {item.itemName}
                    </h3>
                    
                    <p className="text-xs text-[#666666] line-clamp-2">
                      {item.description || 'No detailed description provided.'}
                    </p>

                    <div className="pt-2 space-y-1.5 border-t border-[#E8E1D5] text-xs text-[#666666]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#000B76] shrink-0" />
                        <span className="truncate">{location || 'Campus'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#000B76] shrink-0" />
                        <span>{new Date(itemDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-6 pt-0">
                  <Link
                    to={isLost ? `/lost-item/${item._id}` : `/found-item/${item._id}`}
                    className="w-full py-3 rounded-2xl bg-[#E5DEC9] hover:bg-[#DCD3C3] text-[#1A1A1A] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    View Item Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}