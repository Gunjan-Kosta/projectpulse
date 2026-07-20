import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { 
  FiUsers, FiFolder, FiCheckSquare, FiAward, 
  FiClock, FiAlertCircle, FiTrendingUp 
} from 'react-icons/fi';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      if (user.role === 'admin') endpoint = '/api/admin/dashboard';
      else if (user.role === 'mentor') endpoint = '/api/mentor/dashboard';
      else if (user.role === 'leader') endpoint = '/api/leader/dashboard';
      else if (user.role === 'member') endpoint = '/api/member/dashboard';

      if (endpoint) {
        const { data: res } = await api.get(endpoint);
        if (res.success) {
          setData(res);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Define renders based on role
  const renderAdminDashboard = () => {
    const { stats, teamProjects, roleData, recentActivity } = data || {};
    
    const chartData = teamProjects && teamProjects.length > 0 ? teamProjects : [
      { name: 'No Teams', Progress: 0 }
    ];

    const pieData = roleData && roleData.length > 0 ? roleData : [
      { name: 'Mentors', value: 0 },
      { name: 'Team Leaders', value: 0 },
      { name: 'Team Members', value: 0 },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Admin Console</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Overview of the entire ProjectPulse ecosystem.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FiUsers size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Teams</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.totalTeams || 0}</span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Users</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.totalUsers || 0}</span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FiFolder size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Active Projects</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.activeProjects || 0}</span>
            </div>
          </div>
        </div>

        {/* Charts & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Team Project Progress (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                  <Bar dataKey="Progress" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Distribution */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-4 uppercase tracking-wider">User Roles</h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 text-center gap-1">
              {pieData.map((role, idx) => (
                <div key={role.name}>
                  <span className="text-[10px] font-semibold text-slate-400 block truncate">{role.name}</span>
                  <span className="text-sm font-bold" style={{ color: COLORS[idx] }}>{role.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-6 uppercase tracking-wider">System Activity Stream</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((act, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 last:pb-0">
                  <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{act.message}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">{new Date(act.time).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                No recent system activity.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMentorDashboard = () => {
    const { stats, teamProjects, recentUpdates } = data || {};
    
    const chartData = teamProjects && teamProjects.length > 0 ? teamProjects : [
      { name: 'No Supervised Teams', Completion: 0 }
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Mentor Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Review project completions and supervise teams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Assigned Teams</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.totalTeams || 0}</span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FiAward size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pending Milestone Reviews</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.pendingReviews || 0}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teamwise progress */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Supervised Teams Progress (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Completion" fill="#10B981" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity/Updates Log */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Recent Supervised Activity</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {recentUpdates && recentUpdates.length > 0 ? (
                recentUpdates.map((upd, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0">
                    <FiTrendingUp className="text-emerald-500 mt-0.5 flex-shrink-0" size={14} />
                    <div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">{upd.message}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(upd.time).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                  No recent activities from supervised teams.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderDashboard = () => {
    const { stats, recentTasks, milestones } = data || {};
    
    // Pie Chart Data: Completed vs Pending
    const pieData = [
      { name: 'Completed Tasks', value: stats?.completedTasks || 0 },
      { name: 'Pending Tasks', value: stats?.pendingTasks || 0 },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Team Leader Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Manage tasks, deadlines, and project details.</p>
          </div>
          {stats?.projectName && (
            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-bold uppercase tracking-wide flex items-center gap-2">
              <FiFolder /> {stats.projectName} ({stats.projectStatus})
            </div>
          )}
        </div>

        {/* Project Progress Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/20">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-widest block mb-1">Overall Project Completion</span>
              <h2 className="text-3xl font-extrabold font-poppins">{stats?.projectProgress || 0}%</h2>
            </div>
            <FiTrendingUp size={36} className="text-blue-100 opacity-80" />
          </div>
          <div className="w-full bg-blue-700/50 rounded-full h-2">
            <div className="bg-emerald-400 h-2 rounded-full transition-all duration-500" style={{ width: `${stats?.projectProgress || 0}%` }}></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <FiClock size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pending Tasks</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.pendingTasks || 0}</span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FiCheckSquare size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Completed Tasks</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.completedTasks || 0}</span>
            </div>
          </div>
        </div>

        {/* Tasks and Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Tasks */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Project Tasks</h3>
            <div className="space-y-4">
              {recentTasks && recentTasks.length > 0 ? (
                recentTasks.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{t.title}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Assigned to: {t.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      t.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : t.status === 'In Progress'
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                  No tasks created yet. Go to Tasks page to create.
                </div>
              )}
            </div>
          </div>

          {/* Task Split Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Task Status Split</h3>
            <div className="h-44 flex items-center justify-center">
              {stats?.completedTasks === 0 && stats?.pendingTasks === 0 ? (
                <div className="text-xs text-slate-400 dark:text-slate-500">No task data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Completed:</span>
                <span className="font-bold text-emerald-500">{stats?.completedTasks || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Pending:</span>
                <span className="font-bold text-amber-500">{stats?.pendingTasks || 0}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderMemberDashboard = () => {
    const { stats, recentTasks } = data || {};

    const pieData = [
      { name: 'Completed', value: stats?.completedTasks || 0 },
      { name: 'Pending', value: stats?.pendingTasks || 0 },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Workspace</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">View and update your project tasks.</p>
          </div>
          {stats?.projectName && (
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold uppercase tracking-wide">
              {stats.projectName} ({stats.projectProgress}% Complete)
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FiFolder size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Assigned Tasks</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.totalTasks || 0}</span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <FiClock size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pending Tasks</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.pendingTasks || 0}</span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FiCheckSquare size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Completed Tasks</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins">{stats?.completedTasks || 0}</span>
            </div>
          </div>
        </div>

        {/* Task Board summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-6 uppercase tracking-wider font-semibold">My Latest Tasks</h3>
            <div className="space-y-4">
              {recentTasks && recentTasks.length > 0 ? (
                recentTasks.map((t, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{t.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Deadline: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'None'}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      t.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : t.status === 'In Progress'
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                  No tasks assigned to you yet!
                </div>
              )}
            </div>
          </div>

          {/* Task status split */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white mb-4 uppercase tracking-wider font-semibold">Status Split</h3>
            <div className="h-44 flex items-center justify-center">
              {stats?.totalTasks === 0 ? (
                <span className="text-xs text-slate-400">No task statistics</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 text-center text-xs mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Completed</span>
                <span className="text-sm font-extrabold text-emerald-500">{stats?.completedTasks || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Pending</span>
                <span className="text-sm font-extrabold text-amber-500">{stats?.pendingTasks || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dispatch based on user role
  switch (user?.role) {
    case 'admin':
      return renderAdminDashboard();
    case 'mentor':
      return renderMentorDashboard();
    case 'leader':
      return renderLeaderDashboard();
    case 'member':
      return renderMemberDashboard();
    default:
      return (
        <div className="p-6 text-center text-red-500">
          <FiAlertCircle className="mx-auto mb-2 text-3xl" />
          Access Denied: Unknown role format.
        </div>
      );
  }
};

export default Dashboard;
