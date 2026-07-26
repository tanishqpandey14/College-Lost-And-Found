import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Shield, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <div className="space-y-4 lg:pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5DEC9] text-[#000B76] text-xs font-bold tracking-wider uppercase">
              <UserPlus className="w-4 h-4" />
              Campus Lost & Found
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] leading-[1.15]">
              College Lost & Found <br className="hidden sm:inline" />
              Management System
            </h1>
            
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed max-w-lg">
              Create an account to report missing items, match found belongings using AI similarity algorithms, and securely communicate with peers.
            </p>

            <div className="space-y-2 pt-3 border-t border-[#E8E1D5]">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1A1A1A]">
                <CheckCircle className="w-4 h-4 text-[#000B76] shrink-0" /> Report & Track Lost Items
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1A1A1A]">
                <CheckCircle className="w-4 h-4 text-[#000B76] shrink-0" /> AI-Powered Match Alerts
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1A1A1A]">
                <CheckCircle className="w-4 h-4 text-[#000B76] shrink-0" /> Secure Ownership Verification
              </div>
            </div>
          </div>

          {/* Right Column: Scaled Register Card */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3.5">
              
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-[#000B76] rounded-xl flex items-center justify-center mx-auto shadow-sm">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Create Account</h2>
                <p className="text-xs text-[#666666]">Sign up to start reporting and recovering items.</p>
              </div>

              {error && (
                <div className="p-2 rounded-xl bg-[#C90035]/10 border border-[#C90035]/20 text-[#C90035] text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#1A1A1A] uppercase mb-0.5">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your Name"
                    className="w-full px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#1A1A1A] uppercase mb-0.5">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your Email"
                    className="w-full px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#1A1A1A] uppercase mb-0.5">
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your Mobile Number"
                    className="w-full px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#1A1A1A] uppercase mb-0.5">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create your Password"
                    className="w-full px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-[#000B76] hover:bg-[#000B76]/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="text-center pt-2 border-t border-[#E8E1D5]">
                <p className="text-xs text-[#666666]">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#000B76] hover:underline">
                    Sign in here
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