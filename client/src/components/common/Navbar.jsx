import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Shield, LayoutDashboard, Search, PlusCircle, Inbox, User, LogOut, LogIn } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EFE9DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#000B76] text-white flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A]">
            College Lost & Found
          </span>
        </Link>

        {/* Navigation Tabs (Pill Style matching screenshots) */}
        {user && (
          <nav className="hidden md:flex items-center bg-[#F4EFE6] p-1.5 rounded-full border border-[#E8E1D5]">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'bg-[#E5DEC9] text-[#000B76] shadow-sm font-semibold' 
                  : 'text-[#666666] hover:text-[#1A1A1A]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/lost-item/new"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/lost-item/new')
                  ? 'bg-[#E5DEC9] text-[#000B76] shadow-sm font-semibold'
                  : 'text-[#666666] hover:text-[#1A1A1A]'
              }`}
            >
              <Search className="w-4 h-4" />
              Lost Item
            </Link>

            <Link
              to="/found-item/new"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/found-item/new')
                  ? 'bg-[#E5DEC9] text-[#000B76] shadow-sm font-semibold'
                  : 'text-[#666666] hover:text-[#1A1A1A]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Found Item
            </Link>

            <Link
              to="/claims"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/claims')
                  ? 'bg-[#E5DEC9] text-[#000B76] shadow-sm font-semibold'
                  : 'text-[#666666] hover:text-[#1A1A1A]'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Claims
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/profile')
                  ? 'bg-[#E5DEC9] text-[#000B76] shadow-sm font-semibold'
                  : 'text-[#666666] hover:text-[#1A1A1A]'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </nav>
        )}

        {/* Action Button */}
        <div>
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1A1A1A]/20 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F4EFE6] transition-colors"
            >
              Sign out
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#000B76] text-white text-sm font-semibold shadow-md hover:bg-[#000B76]/90 transition-colors"
            >
              Sign in
              <LogIn className="w-4 h-4" />
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};