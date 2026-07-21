import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FiUsers, FiUser, FiPlusCircle, FiFileText, FiX, FiCheck, FiRefreshCw, FiGrid, FiUserPlus, FiUnlock } from 'react-icons/fi';

const Teams = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [teamDetail, setTeamDetail] = useState(null); // Non-admins assigned team details

  // Admin Tab selection: 'teams' or 'users'
  const [activeTab, setActiveTab] = useState('teams');

  // Admin states
  const [users, setUsers] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Team Form States
  const [teamName, setTeamName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // New User Form States
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('member');
  const [createdUserData, setCreatedUserData] = useState(null); // To display temp credentials

  const loadData = async () => {
    try {
      setLoading(true);
      if (user.role === 'admin') {
        const { data: teamRes } = await api.get('/api/admin/teams');
        const { data: userRes } = await api.get('/api/admin/users');
        if (teamRes.success) setTeams(teamRes.teams);
        if (userRes.success) setUsers(userRes.users);
      } else if (user.role === 'mentor') {
        const { data: mentorRes } = await api.get('/api/mentor/teams');
        if (mentorRes.success) setTeams(mentorRes.teams);
      } else {
        // Leader or Member
        const { data: commonRes } = await api.get('/api/common/team');
        if (commonRes.success) setTeamDetail(commonRes.team);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamName || !projectName || !mentorId || !leaderId) {
      return toast.error('Please enter all required fields');
    }

    try {
      setSubmitting(true);
      const { data: res } = await api.post('/api/admin/teams', {
        teamName,
        mentorId,
        leaderId,
        memberIds: selectedMembers,
        projectName,
        projectDescription
      });

      if (res.success) {
        toast.success('Team created and assigned successfully');
        setShowTeamModal(false);
        setTeamName('');
        setProjectName('');
        setProjectDescription('');
        setMentorId('');
        setLeaderId('');
        setSelectedMembers([]);
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserRole) {
      return toast.error('Please enter name, email, and role');
    }

    try {
      setSubmitting(true);
      const { data: res } = await api.post('/api/admin/users', {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole
      });

      if (res.success) {
        toast.success('Account created successfully');
        setCreatedUserData(res.data); // Stores tempPassword & credentials to display
        setNewUserName('');
        setNewUserEmail('');
        setNewUserRole('member');
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${userName}?`)) return;
    try {
      const { data: res } = await api.post(`/api/admin/users/reset-password/${userId}`);
      if (res.success) {
        toast.success(`Password reset. Temp password: Pulse@123`);
        alert(res.message); // Show credentials dialogue
      }
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Admin View with tabbed layout (Teams and Users management)
  const renderAdminView = () => {
    const mentors = users.filter(u => u.role === 'mentor');
    const leaders = users.filter(u => u.role === 'leader' && (!u.team || u.team === null));
    const members = users.filter(u => u.role === 'member' && (!u.team || u.team === null));

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Administration Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Manage workspace accounts, team configurations, and evaluation links.</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'teams' ? (
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                <FiPlusCircle /> Assemble Team
              </button>
            ) : (
              <button
                onClick={() => {
                  setCreatedUserData(null);
                  setShowUserModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                <FiUserPlus /> Create User Account
              </button>
            )}
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-2.5 text-xs font-bold font-poppins border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'teams'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <FiUsers /> Team Setup ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 text-xs font-bold font-poppins border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <FiUser /> User Directory ({users.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'teams' ? (
          /* Teams List view */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams && teams.length > 0 ? (
              teams.map((t) => (
                <div key={t._id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white font-poppins">{t.name}</h3>
                      <p className="text-[10px] text-primary font-semibold uppercase mt-0.5">{t.project?.name || 'No Project Assigned'}</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-slate-105 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-md border border-slate-200/40 dark:border-slate-700/60">
                      {t.members.length + 1} Members
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Mentor</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{t.mentor?.name || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Team Leader</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{t.leader?.name || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Members</span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.members.map((m) => (
                        <span key={m._id} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold rounded-lg text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <FiUsers size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No teams assembled yet.</p>
              </div>
            )}
          </div>
        ) : (
          /* Users list table */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase border-b border-slate-200/60 dark:border-slate-800">
                    <th className="p-4 pl-6">Name</th>
                    <th className="p-4">User ID</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Team</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">{u.name}</td>
                        <td className="p-4 font-mono text-[10px] font-semibold text-slate-400">{u.userId}</td>
                        <td className="p-4 text-slate-500 font-medium">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            u.role === 'admin'
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : u.role === 'mentor'
                              ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                              : u.role === 'leader'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-semibold">{u.teamDisplay || u.team?.name || 'Unassigned'}</td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleResetPassword(u._id, u.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 hover:border-red-500/30 hover:bg-red-500/5 text-slate-500 hover:text-red-500 transition-all"
                            title="Reset password to Pulse@123"
                          >
                            <FiUnlock size={11} /> Reset Pwd
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No accounts created.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Creating Team */}
        {showTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2"><FiUsers className="text-primary" /> Create Project Team</h3>
                <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-650"><FiX size={18} /></button>
              </div>

              <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Group Alpha, Web Devs"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Portfolio Builder"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Project Description</label>
                    <input
                      type="text"
                      placeholder="Brief detail"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Assign Project Mentor *</label>
                  <select
                    required
                    value={mentorId}
                    onChange={(e) => setMentorId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                  >
                    <option value="">-- Choose Mentor --</option>
                    {mentors.map((m) => (
                      <option key={m._id} value={m._id}>{m.name} ({m.userId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Select Team Leader *</label>
                  <select
                    required
                    value={leaderId}
                    onChange={(e) => setLeaderId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                  >
                    <option value="">-- Choose Team Leader --</option>
                    {leaders.map((l) => (
                      <option key={l._id} value={l._id}>{l.name} ({l.userId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Select Team Members</label>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-36 overflow-y-auto p-3 space-y-2 bg-slate-50 dark:bg-slate-800">
                    {members.length > 0 ? (
                      members.map((m) => (
                        <label key={m._id} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(m._id)}
                            onChange={() => handleMemberToggle(m._id)}
                            className="rounded border-slate-300 text-primary cursor-pointer"
                          />
                          <span>{m.name} ({m.userId})</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-2 text-center">No unassigned members available.</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-80 transition-all duration-200 text-xs"
                >
                  {submitting ? <Spinner size="sm" color="white" /> : 'Assemble Team'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Creating User */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2"><FiUserPlus className="text-primary" /> Create User Account</h3>
                <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-650"><FiX size={18} /></button>
              </div>

              {createdUserData ? (
                /* Display Temp credentials if successfully created */
                <div className="space-y-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">⚡ Account Created Successfully</h4>
                  <p className="text-slate-600 dark:text-slate-350">Provide the following login credentials to the user:</p>
                  <div className="space-y-1.5 font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100/60 dark:border-emerald-900/40">
                    <p><span className="text-slate-400">User ID:</span> <span className="font-bold text-slate-800 dark:text-white">{createdUserData.userId}</span></p>
                    <p><span className="text-slate-400">Email:</span> <span className="font-bold text-slate-800 dark:text-white">{createdUserData.email}</span></p>
                    <p><span className="text-slate-400">Password:</span> <span className="font-bold text-slate-800 dark:text-white">{createdUserData.tempPassword}</span></p>
                  </div>
                  <button
                    onClick={() => setCreatedUserData(null)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold mt-2"
                  >
                    Create Another User
                  </button>
                </div>
              ) : (
                /* Create User Form */
                <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Doe or Bob Smith"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. bob@college.edu"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Select System Role *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                    >
                      <option value="mentor">Mentor</option>
                      <option value="leader">Team Leader</option>
                      <option value="member">Team Member</option>
                    </select>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">Credentials (User ID and a temporary password) will be auto-generated upon creation.</p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-80 transition-all duration-200 text-xs"
                  >
                    {submitting ? <Spinner size="sm" color="white" /> : 'Create User'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mentor Supervised Teams View
  const renderMentorView = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Assigned Teams</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Explore progress details for teams you supervise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams && teams.length > 0 ? (
            teams.map((t) => (
              <div key={t._id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white font-poppins">{t.name}</h3>
                    <p className="text-[10px] text-primary font-semibold uppercase mt-0.5">{t.project?.name || 'No Project Assigned'}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                    {t.project?.status || 'Not Started'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Team Leader</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5"><FiUser className="text-primary" size={13} /> {t.leader?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Project Progress</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${t.project?.progress || 0}%` }} />
                      </div>
                      <span className="font-bold font-poppins text-[10px]">{t.project?.progress || 0}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-1">Supervised Members</span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.members.map((m) => (
                      <span key={m._id} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold rounded-lg text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <FiUsers size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 font-medium">No assigned teams found.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Student Leader/Member View
  const renderStudentView = () => {
    if (!teamDetail) {
      return (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <FiUsers size={32} className="mx-auto text-slate-400 mb-2" />
          <h3 className="font-bold text-slate-800 dark:text-white font-poppins">No Team Assigned</h3>
          <p className="text-xs text-slate-500 mt-1">Please contact System Admin to assign you to a project team.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Our Team</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Members list and project supervisor contact details.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">{teamDetail.name}</h2>
              {teamDetail.project && <p className="text-xs font-semibold text-primary uppercase mt-0.5"><FiFileText className="inline mr-1" /> {teamDetail.project.name}</p>}
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-full uppercase">
              {teamDetail.project?.status || 'Not Started'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-2">Faculty Mentor</span>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  {teamDetail.mentor?.name ? teamDetail.mentor.name[0].toUpperCase() : 'M'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-poppins">{teamDetail.mentor?.name}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{teamDetail.mentor?.email}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-2">Team Leader</span>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  {teamDetail.leader?.name ? teamDetail.leader.name[0].toUpperCase() : 'L'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-poppins">{teamDetail.leader?.name}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{teamDetail.leader?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-3">Group Members ({teamDetail.members?.length || 0})</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamDetail.members?.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-350 flex items-center justify-center font-bold text-xs">
                    {m.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</h5>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (user?.role) {
    case 'admin':
      return renderAdminView();
    case 'mentor':
      return renderMentorView();
    case 'leader':
    case 'member':
      return renderStudentView();
    default:
      return null;
  }
};

export default Teams;
