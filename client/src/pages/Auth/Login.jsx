import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Shield, ArrowRight, Sparkles, Search, MessageSquare } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-18 flex flex-col justify-between bg-[#FAF7F2] overflow-hidden">
      
      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-center overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Info & Branding */}
          <div className="space-y-5 lg:pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5DEC9] text-[#000B76] text-xs font-bold tracking-wider uppercase">
              <Shield className="w-4 h-4" />
              Campus Lost & Found
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] leading-[1.15]">
              College Lost & Found <br className="hidden sm:inline" />
              Management System
            </h1>
            
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed max-w-lg">
              Reclaim lost assets across campus with AI-powered semantic matching, secure verification, and real-time student communication.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E8E1D5]">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1A1A1A]">
                <Sparkles className="w-4 h-4 text-[#000B76] shrink-0" /> AI Matching
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1A1A1A]">
                <Search className="w-4 h-4 text-[#000B76] shrink-0" /> Instant Search
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1A1A1A]">
                <MessageSquare className="w-4 h-4 text-[#000B76] shrink-0" /> Live Chat
              </div>
            </div>
          </div>

          {/* Right Column: Scaled Login Card */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-7 sm:p-9 shadow-sm space-y-5">
              
              <div className="text-center space-y-1.5">
                <div className="w-11 h-11 bg-[#000B76] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Welcome back</h2>
                <p className="text-xs text-[#666666]">Sign in to continue to College Lost & Found.</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-[#C90035]/10 border border-[#C90035]/20 text-[#C90035] text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-[#1A1A1A] uppercase mb-1">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Email"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold tracking-wider text-[#1A1A1A] uppercase">
                      PASSWORD
                    </label>
                    <span className="text-xs text-[#000B76] font-semibold cursor-pointer hover:underline">
                      Forgot?
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-2xl bg-[#000B76] hover:bg-[#000B76]/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center pt-2.5 border-t border-[#E8E1D5]">
                <p className="text-xs text-[#666666]">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-[#000B76] hover:underline">
                    Register here
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Pinned Bottom Footer Bar */}
      <footer className="w-full bg-[#000B76] text-white py-2.5 text-center text-xs font-medium tracking-wide shrink-0 z-10">
        Campus Lost & Found Project by Tanishq Pandey
      </footer>

    </div>
  );
}