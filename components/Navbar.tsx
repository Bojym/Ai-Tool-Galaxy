import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, APP_ROUTES, HomeIcon, ChatBubbleLeftEllipsisIcon, NewspaperIcon, PlusCircleIcon, UserCircleIcon, Cog6ToothIcon, HeartIcon, ChevronDownIcon, SparklesIcon, ClipboardDocumentCheckIcon, ShieldCheckIcon } from '../constants';
import { getCategories, getTools } from '../services/toolService';
import { ToolCategory } from '../types';
import AuthModal from './AuthModal';

const Navbar: React.FC = () => {
  const { currentUser, logout, isLoading: authLoading, refreshUser } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isExploreDropdownOpen, setIsExploreDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const exploreDropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      // Removed click outside handling for explore dropdown since it's now hover-based
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch pending submissions count for admin
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (currentUser?.isAdmin) {
        try {
          const allTools = await getTools();
          const pending = allTools.filter(tool => 
            tool.fullDescription === 'Pending Review' || 
            tool.shortDescription.includes('[PENDING]') ||
            tool.submittedBy !== 'admin1'
          );
          setPendingCount(pending.length);
        } catch (error) {
          console.error('Failed to fetch pending count:', error);
        }
      }
    };
    fetchPendingCount();
  }, [currentUser]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleExploreMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsExploreDropdownOpen(true);
  };

  const handleExploreMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsExploreDropdownOpen(false);
    }, 150); // 150ms delay before closing
    setHoverTimeout(timeout);
  };

  const handleAdminMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsAdminDropdownOpen(true);
  };

  const handleAdminMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsAdminDropdownOpen(false);
    }, 150); // 150ms delay before closing
    setHoverTimeout(timeout);
  };



  const NavItem: React.FC<{ to: string; children: React.ReactNode; icon?: React.ReactNode; exact?: boolean }> = ({ to, children, icon, exact = false }) => (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-[#6C4DFF] ${
          isActive ? 'text-[#6C4DFF] font-semibold' : 'text-[#475569]' // textSecondary for inactive, primaryAccent for active
        }`
      }
    >
      {icon && <span className="mr-2 w-5 h-5">{icon}</span>}
      {children}
    </NavLink>
  );

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-lg shadow-sm fixed w-full z-40 top-0 border-b border-[#E5E7EB]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16"> {/* Reduced height to h-16 */}
            <Link to={APP_ROUTES.HOME} className="flex items-center space-x-2 text-xl font-bold text-[#6C4DFF] hover:text-purple-700 transition-colors">
              {/* Using an image for logo as per screenshot */}
              <img src="data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23A77FFF;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%236C4DFF;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='45' fill='url(%23grad)'/%3E%3Ctext x='50' y='62' font-family='Arial, sans-serif' font-size='40' fill='white' text-anchor='middle' font-weight='bold'%3EAI%3C/text%3E%3C/svg%3E" alt="AI Catalog Logo" className="h-8 w-8" />
              <span className="text-[#0F172A]">AICatalog</span>
            </Link>
            <div className="hidden md:flex items-center space-x-1"> {/* Reduced space for more items */}
              <NavItem to={APP_ROUTES.HOME} icon={<HomeIcon className="w-4 h-4"/>} exact>Home</NavItem>
              
              {/* Explore dropdown */}
              <div 
                className="relative" 
                ref={exploreDropdownRef}
                onMouseEnter={handleExploreMouseEnter}
                onMouseLeave={handleExploreMouseLeave}
              >
                <button
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-[#6C4DFF] text-[#475569]"
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Explore
                  <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isExploreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isExploreDropdownOpen && (
                  <div className="origin-top-left absolute left-0 mt-1 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-80 overflow-y-auto">
                    <Link
                      to={APP_ROUTES.EXPLORE}
                      className="block px-4 py-2 text-sm text-[#475569] hover:bg-slate-100 hover:text-[#6C4DFF] font-medium border-b border-slate-100"
                    >
                      <SparklesIcon className="w-4 h-4 inline mr-2" />
                      All Categories
                    </Link>
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        to={`${APP_ROUTES.EXPLORE}?category=${category.id}`}
                        className="block px-4 py-2 text-sm text-[#475569] hover:bg-slate-100 hover:text-[#6C4DFF] transition-colors"
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <NavItem to={APP_ROUTES.FORUMS} icon={<ChatBubbleLeftEllipsisIcon className="w-4 h-4"/>}>Forums</NavItem>
              <NavItem to={APP_ROUTES.NEWSLETTER} icon={<NewspaperIcon className="w-4 h-4"/>}>Newsletter</NavItem>
              {currentUser && <NavItem to={APP_ROUTES.SUBMIT_TOOL} icon={<PlusCircleIcon className="w-4 h-4"/>}>Submit Tool</NavItem>}
              
              {/* Admin dropdown */}
              {currentUser?.isAdmin && (
                <div 
                  className="relative" 
                  ref={adminDropdownRef}
                  onMouseEnter={handleAdminMouseEnter}
                  onMouseLeave={handleAdminMouseLeave}
                >
                  <button
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-[#6C4DFF] text-[#475569]"
                  >
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Admin
                    <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isAdminDropdownOpen && (
                    <div className="origin-top-left absolute left-0 mt-1 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <Link
                        to={APP_ROUTES.ADD_TOOL}
                        className="block px-4 py-2 text-sm text-[#475569] hover:bg-slate-100 hover:text-[#6C4DFF] transition-colors"
                      >
                        <PlusCircleIcon className="w-4 h-4 inline mr-2" />
                        Add Tool
                      </Link>
                      <Link
                        to={APP_ROUTES.ADMIN_REVIEW}
                        className="block px-4 py-2 text-sm text-[#475569] hover:bg-slate-100 hover:text-[#6C4DFF] transition-colors relative"
                      >
                        <ClipboardDocumentCheckIcon className="w-4 h-4 inline mr-2" />
                        Review Submissions
                        {pendingCount > 0 && (
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {authLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-[#475569]">Loading...</div>
                  <button
                    onClick={async () => {
                      try {
                        await refreshUser();
                      } catch (error) {
                        console.error('Failed to refresh user:', error);
                      }
                    }}
                    className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                    title="Click if stuck loading"
                  >
                    Reset
                  </button>
                </div>
              ) : currentUser ? (
                <>
                  <NavLink to={APP_ROUTES.FAVORITES} className="text-[#475569] hover:text-[#6C4DFF] p-1 rounded-full">
                    <HeartIcon className="w-5 h-5" />
                    <span className="sr-only">Favorites</span>
                  </NavLink>
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#6C4DFF]"
                    >
                      {/* Placeholder for User Avatar with Initials */}
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#6C4DFF] text-white text-xs font-semibold">
                        {currentUser.username?.substring(0,2).toUpperCase() || 'JB'}
                      </span>
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="px-4 py-3">
                          <p className="text-sm text-[#0F172A] font-medium">{currentUser.username}</p>
                          {currentUser.email && <p className="text-xs text-[#475569] truncate">{currentUser.email}</p>}
                        </div>
                        <div className="border-t border-[#E5E7EB]"></div>
                        <NavLink to={APP_ROUTES.PROFILE} className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'bg-slate-100 text-[#6C4DFF]' : 'text-[#475569]'} hover:bg-slate-100 hover:text-[#6C4DFF] w-full text-left flex items-center`} onClick={() => setIsProfileDropdownOpen(false)}>
                          <UserCircleIcon className="w-4 h-4 mr-2" /> Profile
                        </NavLink>
                        <NavLink to={APP_ROUTES.FAVORITES} className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'bg-slate-100 text-[#6C4DFF]' : 'text-[#475569]'} hover:bg-slate-100 hover:text-[#6C4DFF] w-full text-left flex items-center`} onClick={() => setIsProfileDropdownOpen(false)}>
                          <HeartIcon className="w-4 h-4 mr-2" /> Favorites
                        </NavLink>
                        <button
                          onClick={async () => { 
                            try {
                              await refreshUser(); 
                              setIsProfileDropdownOpen(false);
                            } catch (error) {
                              console.error('Failed to refresh user:', error);
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#475569] hover:bg-slate-100 hover:text-[#6C4DFF] transition-colors flex items-center"
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-2" /> Refresh Profile
                        </button>
                        <button
                          onClick={async () => { await logout(); setIsProfileDropdownOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#475569] hover:bg-slate-100 hover:text-red-600 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-1.5 bg-[#6C4DFF] hover:bg-purple-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          {/* Mobile Nav - simplified for now */}
           <div className="md:hidden flex justify-around py-2 border-t border-[#E5E7EB]">
                <NavItem to={APP_ROUTES.HOME} icon={<HomeIcon className="w-5 h-5"/>} exact><span className="sr-only">Home</span></NavItem>
                <NavItem to={APP_ROUTES.EXPLORE} icon={<SparklesIcon className="w-5 h-5"/>}><span className="sr-only">Explore</span></NavItem> {/* Updated mobile NavItem */}
                <NavItem to={APP_ROUTES.FORUMS} icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5"/>}><span className="sr-only">Forums</span></NavItem>
                <NavItem to={APP_ROUTES.NEWSLETTER} icon={<NewspaperIcon className="w-5 h-5"/>}><span className="sr-only">Newsletter</span></NavItem>
                {currentUser && <NavItem to={APP_ROUTES.SUBMIT_TOOL} icon={<PlusCircleIcon className="w-5 h-5"/>}><span className="sr-only">Submit</span></NavItem>}
            </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode="signin"
      />
    </>
  );
};

export default Navbar;