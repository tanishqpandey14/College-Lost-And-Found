import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api'; // <-- double dots
import { AuthContext } from '../../context/AuthContext'; // <-- double dots
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Mail, 
  Phone, 
  User,
  MapPin,
  Clock
} from 'lucide-react';

export default function ClaimsPage() {
  const { user } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [meetings, setMeetings] = useState({}); // Stores meetings mapped by claimId
  const [loading, setLoading] = useState(true);
  const [reviewingClaimId, setReviewingClaimId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Meeting Schedule Modal State
  const [schedulingClaim, setSchedulingClaim] = useState(null);
  const [meetingData, setMeetingData] = useState({
    location: '',
    scheduledDate: '',
    scheduledTime: '14:00',
    note: ''
  });

  useEffect(() => {
    fetchClaimsAndMeetings();
  }, []);

  const fetchClaimsAndMeetings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/claims');
      const fetchedClaims = res.data.claims || [];
      setClaims(fetchedClaims);

      // Fetch scheduled meeting details for accepted claims
      const acceptedClaims = fetchedClaims.filter((c) => c.status === 'Accepted' || c.status === 'Completed');
      const meetingMap = {};

      await Promise.all(
        acceptedClaims.map(async (c) => {
          try {
            const mRes = await API.get(`/meetings/${c._id}`);
            if (mRes.data?.meeting) {
              meetingMap[c._id] = mRes.data.meeting;
            }
          } catch (err) {
            console.warn(`No meeting found for claim ${c._id}`);
          }
        })
      );

      setMeetings(meetingMap);
    } catch (err) {
      console.error('Error fetching claims or meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (claimId, action) => {
    try {
      await API.put(`/claims/${claimId}/review`, {
        action,
        rejectionReason: action === 'REJECT' ? rejectionReason : undefined
      });
      setReviewingClaimId(null);
      setRejectionReason('');
      fetchClaimsAndMeetings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review claim');
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/meetings', {
        claimId: schedulingClaim._id,
        ...meetingData
      });
      alert('Handover meeting scheduled successfully!');
      
      // Update local state instantly
      if (res.data?.meeting) {
        setMeetings((prev) => ({
          ...prev,
          [schedulingClaim._id]: res.data.meeting
        }));
      }

      setSchedulingClaim(null);
      setMeetingData({ location: '', scheduledDate: '', scheduledTime: '14:00', note: '' });
      fetchClaimsAndMeetings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  // OWNER ONLY: Confirm receipt and close lifecycle
  const handleConfirmReceipt = async (claimId) => {
    if (
      !window.confirm(
        'Are you sure you have received your item? This will close the claim session and mark the report as Returned.'
      )
    ) {
      return;
    }

    try {
      await API.put(`/claims/${claimId}/complete`);
      alert('Receipt confirmed! Item report is now resolved and closed.');
      fetchClaimsAndMeetings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm receipt');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#000B76] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-8 shadow-sm">
        <span className="text-xs font-bold tracking-widest text-[#666666] uppercase">VERIFICATION PORTAL</span>
        <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mt-1">Item Claims & Handover Meetings</h1>
        <p className="text-sm text-[#666666] mt-2">Manage claim submissions, verify ownership details, view contact info, and coordinate returns.</p>
      </div>

      {claims.length === 0 ? (
        <div className="bg-[#F4EFE6] rounded-3xl p-12 text-center border border-[#E8E1D5]">
          <p className="text-[#666666] font-medium text-sm">No ownership claims submitted or received yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => {
            const isFinder = user && claim.finder && (user.id === claim.finder._id || user._id === claim.finder._id);
            const isPending = claim.status === 'Pending';
            const isAccepted = claim.status === 'Accepted';
            const isCompleted = claim.status === 'Completed';

            const otherParty = isFinder ? claim.claimant : claim.finder;
            const scheduledMeeting = meetings[claim._id];

            return (
              <div key={claim._id} className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#000B76] uppercase tracking-wider">
                      {isFinder ? 'CLAIM RECEIVED FROM OWNER' : 'YOUR SUBMITTED CLAIM'}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5">
                      {claim.foundItem?.itemName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                      isPending ? 'bg-[#E5DEC9] text-[#1A1A1A]' :
                      isAccepted ? 'bg-[#007A55]/10 text-[#007A55]' :
                      isCompleted ? 'bg-[#000B76]/10 text-[#000B76]' : 'bg-[#C90035]/10 text-[#C90035]'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>

                {/* Answers / Proof Display */}
                {claim.answers && claim.answers.length > 0 && (
                  <div className="bg-[#EFE9DD] p-4 rounded-2xl border border-[#E2D9C8] space-y-2">
                    <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Verification Answers:</h4>
                    {claim.answers.map((ans, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <p className="text-[#666666] font-medium">Q: {ans.question}</p>
                        <p className="text-[#1A1A1A] font-bold">A: {ans.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scheduled Meeting Card Display */}
                {(isAccepted || isCompleted) && scheduledMeeting && (
                  <div className="bg-[#000B76]/10 border border-[#000B76]/30 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-[#000B76] font-bold text-xs uppercase tracking-wider">
                      <Calendar className="w-4 h-4" />
                      Handover Meeting Scheduled
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-[#1A1A1A]">
                      <div className="flex items-center gap-2.5 bg-[#F4EFE6] p-3 rounded-xl border border-[#E2D9C8]">
                        <MapPin className="w-4 h-4 text-[#000B76] shrink-0" />
                        <div>
                          <p className="text-[10px] text-[#666666] font-semibold uppercase">Location</p>
                          <p className="font-bold">{scheduledMeeting.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-[#F4EFE6] p-3 rounded-xl border border-[#E2D9C8]">
                        <Calendar className="w-4 h-4 text-[#000B76] shrink-0" />
                        <div>
                          <p className="text-[10px] text-[#666666] font-semibold uppercase">Date</p>
                          <p className="font-bold">{scheduledMeeting.scheduledDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-[#F4EFE6] p-3 rounded-xl border border-[#E2D9C8]">
                        <Clock className="w-4 h-4 text-[#000B76] shrink-0" />
                        <div>
                          <p className="text-[10px] text-[#666666] font-semibold uppercase">Time</p>
                          <p className="font-bold">{scheduledMeeting.scheduledTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unlocked Contact Details Section */}
                {(isAccepted || isCompleted) && (
                  <div className="bg-[#007A55]/10 border border-[#007A55]/30 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-[#007A55] font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      Contact Details Unlocked ({isFinder ? 'Claimant' : 'Finder'})
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-[#1A1A1A]">
                      <div className="flex items-center gap-2.5 bg-[#F4EFE6] p-3 rounded-xl border border-[#E2D9C8]">
                        <User className="w-4 h-4 text-[#007A55] shrink-0" />
                        <div>
                          <p className="text-[10px] text-[#666666] font-semibold uppercase">Name</p>
                          <p className="font-bold">{otherParty?.name || 'Peer Student'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-[#F4EFE6] p-3 rounded-xl border border-[#E2D9C8]">
                        <Mail className="w-4 h-4 text-[#007A55] shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-[10px] text-[#666666] font-semibold uppercase">Email</p>
                          <p className="font-bold truncate">{otherParty?.email || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-[#F4EFE6] p-3 rounded-xl border border-[#E2D9C8]">
                        <Phone className="w-4 h-4 text-[#007A55] shrink-0" />
                        <div>
                          <p className="text-[10px] text-[#666666] font-semibold uppercase">Phone</p>
                          <p className="font-bold">{otherParty?.phoneNumber || 'Not Provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Finder Action Controls */}
                {isFinder && isPending && (
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleReview(claim._id, 'ACCEPT')}
                      className="px-6 py-2.5 rounded-full bg-[#007A55] text-white font-bold text-xs hover:bg-[#007A55]/90 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Ownership Claim
                    </button>

                    <button
                      onClick={() => setReviewingClaimId(claim._id)}
                      className="px-6 py-2.5 rounded-full bg-[#C90035] text-white font-bold text-xs hover:bg-[#C90035]/90 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline Claim
                    </button>
                  </div>
                )}

                {/* Rejection Form Modal */}
                {reviewingClaimId === claim._id && (
                  <div className="bg-[#EAE3D5] p-4 rounded-2xl border border-[#DCD3C3] space-y-3">
                    <label className="block text-xs font-bold text-[#1A1A1A] uppercase">Reason for Decline *</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Serial number provided did not match."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E2D9C8] text-xs"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(claim._id, 'REJECT')}
                        className="px-4 py-2 rounded-full bg-[#C90035] text-white font-bold text-xs cursor-pointer"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setReviewingClaimId(null)}
                        className="px-4 py-2 rounded-full bg-[#E2D9C8] text-[#1A1A1A] font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Unlocked Actions */}
                {(isAccepted || isCompleted) && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/chat/${claim._id}`}
                      className="px-6 py-3 rounded-full bg-[#000B76] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#000B76]/90 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {isCompleted ? 'View Archived Chat' : 'Open Real-Time Chat'}
                    </Link>

                    {!isCompleted && (
                      <button
                        onClick={() => setSchedulingClaim(claim)}
                        className="px-6 py-3 rounded-full bg-[#E5DEC9] border border-[#DCD3C3] text-[#1A1A1A] font-bold text-xs flex items-center gap-2 hover:bg-[#DCD3C3] transition-all cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-[#000B76]" />
                        {scheduledMeeting ? 'Reschedule Handover' : 'Schedule Handover Meeting'}
                      </button>
                    )}

                    {/* OWNER ONLY ACTION BUTTON */}
                    {!isFinder && !isCompleted && (
                      <button
                        onClick={() => handleConfirmReceipt(claim._id)}
                        className="px-6 py-3 rounded-full bg-[#007A55] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#007A55]/90 transition-all cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        I Received My Item & Close
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Meeting Scheduling Modal */}
      {schedulingClaim && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Schedule Handover</h3>
            
            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#1A1A1A] mb-1">Campus Spot</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Library, Block 2 Canteen, Main Gate..."
                  value={meetingData.location}
                  onChange={(e) => setMeetingData({ ...meetingData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#000B76]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#1A1A1A] mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={meetingData.scheduledDate}
                  onChange={(e) => setMeetingData({ ...meetingData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#000B76]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#1A1A1A] mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={meetingData.scheduledTime}
                  onChange={(e) => setMeetingData({ ...meetingData, scheduledTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#000B76]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-full bg-[#000B76] text-white font-bold text-xs cursor-pointer hover:bg-[#000B76]/90 transition-all"
                >
                  Confirm Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setSchedulingClaim(null)}
                  className="px-6 py-3.5 rounded-full bg-[#E2D9C8] text-[#1A1A1A] font-bold text-xs cursor-pointer hover:bg-[#DCD3C3] transition-all"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}