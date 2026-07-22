import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center my-auto min-h-[calc(100vh-10rem)] px-4">
      <div className="w-full max-w-xl bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
            Create your account
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Join the College Lost & Found community.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#C90035]/10 border border-[#C90035]/20 text-[#C90035] text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                FULL NAME<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Tanishq Pandey"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                EMAIL ADDRESS<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="work.tanishqpandey@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                PHONE NUMBER<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 6265701426"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-1.5">
                PASSWORD<span className="text-[#C90035]"> *</span>
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-[#000B76] hover:bg-[#000B76]/90 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering account...' : 'Register account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-sm text-[#666666] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#000B76] hover:underline">
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  );
}