import React from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiUsers, FiCheckSquare, FiAward, FiMessageSquare, FiArrowRight, FiBell } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 glass h-16 flex items-center justify-between px-6 md:px-12 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-md shadow-primary/20">
            <FiActivity className="text-white text-lg animate-pulse" />
          </div>
          <span className="font-poppins font-bold text-lg tracking-wider text-slate-900 dark:text-white">Project<span className="text-primary">Pulse</span></span>
        </div>
        <Link 
          to="/login" 
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200"
        >
          Login <FiArrowRight size={14} />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6 border border-primary/20">
          🚀 Smart Monitoring for College Teams
        </div>
        <h1 className="text-4xl md:text-6xl font-poppins font-extrabold tracking-tight leading-tight max-w-4xl text-slate-900 dark:text-white mb-6">
          Monitor, Collaborate & Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">College Projects</span> Seamlessly
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
          A centralized, enterprise-style workspace for college project groups. Assign mentors, manage tasks, approve milestones, publish announcements, and chat in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link 
            to="/login" 
            className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-xl shadow-primary/30 hover:shadow-primary/45 hover:-translate-y-0.5 transition-all duration-200"
          >
            Launch System
          </Link>
          <a 
            href="#features" 
            className="px-8 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700/60 hover:-translate-y-0.5 transition-all duration-200"
          >
            Explore Features
          </a>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mb-24 border-y border-slate-200/60 dark:border-slate-800/60 py-10">
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-poppins">100%</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mt-1">Real-time Sync</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-poppins">4</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mt-1">Distinct Roles</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-poppins">0</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mt-1">Email Spam</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-poppins">5x</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mt-1">Faster Review</span>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full text-left scroll-mt-24 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-poppins text-slate-900 dark:text-white mb-4">Core Ecosystem Features</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Everything you need to guide and track academic project teams in one cohesive tool.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-5">
                <FiUsers size={20} />
              </div>
              <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white mb-2">Team Governance</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Admins assign mentors, elect leaders, and group members. Role-based view ensures everyone knows their tasks and updates.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-5">
                <FiCheckSquare size={20} />
              </div>
              <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white mb-2">Task Board</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Leaders construct and assign tasks with explicit deadlines. Members update task status and attach completed code files or ZIPs.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-5">
                <FiAward size={20} />
              </div>
              <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white mb-2">Milestone Reviews</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Submit project deliverables for assessment. Mentors review, reject, or approve submissions and add actionable feedback remarks.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-5">
                <FiMessageSquare size={20} />
              </div>
              <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white mb-2">Real-time Room Chat</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Socket.io enabled team chat room. Team members, leader, and mentor share a unified chat interface with image and PDF sharing.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-5">
                <FiActivity size={20} />
              </div>
              <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white mb-2">Visual Analytics</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Rich dashboards utilizing Recharts displaying project progress, task completions, and team deliverables at a single glance.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-5">
                <FiBell size={20} />
              </div>
              <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white mb-2">Targeted Broadcasts</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Publish system-wide or team-specific announcements. Mentors and Admin easily dispatch news and notice boards.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        &copy; {new Date().getFullYear()} ProjectPulse. Designed for College Academic Teams.
      </footer>

    </div>
  );
};

export default LandingPage;
