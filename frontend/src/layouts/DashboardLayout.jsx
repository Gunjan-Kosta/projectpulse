import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiGrid, FiUsers, FiFolder, FiCheckSquare, FiAward, 
  FiBell, FiMessageSquare, FiSettings, FiLogOut, 
  FiMenu, FiX, FiMoon, FiSun, FiUser, FiActivity 
} from 'react-icons/fi';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid, roles: ['admin', 'mentor', 'leader', 'member'] },
    { name: 'Teams', path: '/teams', icon: FiUsers, roles: ['admin', 'mentor', 'leader', 'member'] },
    { name: 'Projects', path: '/projects', icon: FiFolder, roles: ['admin', 'mentor', 'leader', 'member'] },
    { name: 'Tasks', path: '/tasks', icon: FiCheckSquare, roles: ['leader', 'member'] },
    { name: 'Announcements', path: '/announcements', icon: FiBell, roles: ['mentor', 'leader', 'member'] },
    // Only show Chat if user belongs to a team (leader, member) or is a mentor (supervises teams)
    { name: 'Team Chat', path: '/chat', icon: FiMessageSquare, roles: ['mentor', 'leader', 'member'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const roleLabels = {
    admin: 'System Admin',
    mentor: 'Mentor / Supervisor',
    leader: 'Team Leader',
    member: 'Team Member'
  };

  const roleColors = {
    admin: 'bg-red-500/10 text-red-500 border border-red-500/20',
    mentor: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    leader: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    member: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <FiActivity className="text-white text-lg" />
            </div>
            <span className="font-semibold text-lg tracking-wider text-white font-poppins">Project<span className="text-primary">Pulse</span></span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 font-semibold' 
                    : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                }`}
              >
                <Icon className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-white font-semibold shadow-inner">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{user?.userId}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 lg:hidden focus:outline-none"
            >
              <FiMenu size={20} />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Welcome back</span>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">{user?.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${roleColors[user?.role] || ''}`}>
              {roleLabels[user?.role]}
            </span>

            {/* Dark/Light mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all duration-200"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>

            {/* Profile Dropdown Indicator */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary transition-colors">
                  <FiUser size={16} />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
