import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center my-auto min-h-[calc(100vh-10rem)] px-4">
      <div className="w-full max-w-md bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl p-8 sm:p-10 shadow-sm">
        
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#000B76] text-white flex items-center justify-center shadow-md">
            <Shield className="w-7 h-7 fill-current" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
            Welcome back
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            Sign in to continue to Reclaim.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#C90035]/10 border border-[#C90035]/20 text-[#C90035] text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase mb-2">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">
                PASSWORD
              </label>
              <a href="#forgot" className="text-xs font-semibold text-[#000B76] hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-[#EFE9DD] border border-[#E2D9C8] text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76] text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full bg-[#000B76] hover:bg-[#000B76]/90 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-sm text-[#666666] mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#000B76] hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}