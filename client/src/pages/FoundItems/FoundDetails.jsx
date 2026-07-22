import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Tag, MapPin, User, Calendar, ShieldCheck, Trash2, X, Send } from 'lucide-react';

export default function FoundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      const res = await API.get(`/found-items/${id}`);
      const foundItem = res.data.item;
      setItem(foundItem);

      // Initialize answers state based on verification questions
      if (foundItem.verificationQuestions && foundItem.verificationQuestions.length > 0) {
        setAnswers(
          foundItem.verificationQuestions.map((q) => ({
            question: q.questionText,
            answer: ''
          }))
        );
      } else {
        setAnswers([{ question: 'Describe any specific detail or proof of ownership', answer: '' }]);
      }
    } catch (err) {
      setError('Item not found or removed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index].answer = value;
    setAnswers(updated);
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setClaimError('');
    setIsSubmittingClaim(true);

    try {
      await API.post('/claims', {
        foundItemId: item._id,
        answers
      });
      setIsClaimModalOpen(false);
      navigate('/claims'); // Navigate to claims portal after successful submission
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim request');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently remove this report?')) {
      try {
        await API.delete(`/found-items/${id}`);
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete report');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#000B76] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-[#F4EFE6] rounded-3xl p-8 border border-[#E8E1D5]">
        <p className="text-[#C90035] font-semibold">{error}</p>
        <Link to="/" className="mt-4 inline-block px-6 py-2 rounded-full bg-[#000B76] text-white text-xs font-bold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isFinder = user && item.finder && (user.id === item.finder._id || user._id === item.finder._id);
  const imageUrl = item.images && item.images.length > 0 ? item.images[0].url : 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#000B76] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all items
      </Link>

      <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        
        {/* Image Container */}
        <div className="relative bg-[#EAE3D5] flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={item.itemName}
            className="w-full h-full object-cover max-h-105 rounded-2xl"
          />
          <div className="absolute top-6 left-6">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase bg-[#007A55] text-white shadow-sm">
              FOUND ITEM
            </span>
          </div>
        </div>

        {/* Item Details */}
        <div className="p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
                {item.itemName}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#007A55]/10 text-[#007A55] uppercase">
                {item.status || 'ACTIVE'}
              </span>
            </div>

            <p className="text-sm text-[#666666]">
              {item.description}
            </p>

            <div className="space-y-3 pt-4 border-t border-[#E2D9C8] text-xs text-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#000B76]" />
                <span className="font-semibold text-[#666666]">Category:</span>
                <span>{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#000B76]" />
                <span className="font-semibold text-[#666666]">Location:</span>
                <span>{item.foundLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#000B76]" />
                <span className="font-semibold text-[#666666]">Reported by:</span>
                <span>{item.finder?.name || 'Peer Student'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#000B76]" />
                <span className="font-semibold text-[#666666]">Reported on:</span>
                <span>{new Date(item.foundDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 mt-6 border-t border-[#E2D9C8]">
            {isFinder ? (
              <button
                onClick={handleDelete}
                className="w-full py-3.5 rounded-full bg-[#C90035]/10 border border-[#C90035]/30 text-[#C90035] hover:bg-[#C90035]/20 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Found Report
              </button>
            ) : (
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="w-full py-4 rounded-full bg-[#000B76] hover:bg-[#000B76]/90 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                This looks like mine - Request to Claim
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Claim Submission Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-xl">
            
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Verify Ownership</h3>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="p-1 text-[#666666] hover:text-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#666666]">
              Answer the finder's verification questions to prove this item belongs to you.
            </p>

            {claimError && (
              <div className="p-3 rounded-xl bg-[#C90035]/10 border border-[#C90035]/20 text-[#C90035] text-xs text-center font-medium">
                {claimError}
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              {answers.map((ans, index) => (
                <div key={index} className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1A1A1A]">
                    Question {index + 1}: {ans.question}
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={ans.answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Provide exact details..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-xs font-medium text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] resize-none"
                  ></textarea>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="flex-1 py-3.5 rounded-full bg-[#000B76] text-white font-bold text-xs shadow-md hover:bg-[#000B76]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmittingClaim ? 'Submitting Claim...' : 'Submit Claim Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-6 py-3.5 rounded-full bg-[#E2D9C8] text-[#1A1A1A] font-bold text-xs hover:bg-[#DCD3C3] transition-all cursor-pointer"
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