import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FiBell, FiPlusCircle, FiX, FiTrash2, FiUser, FiCalendar, FiMegaphone } from 'react-icons/fi';

const Announcements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  
  // Modals & Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mentor target teams checklist
  const [mentorTeams, setMentorTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get('/api/common/announcements');
      if (res.success) {
        setAnnouncements(res.announcements);
      }

      if (user.role === 'mentor') {
        const { data: teamRes } = await api.get('/api/mentor/teams');
        if (teamRes.success) {
          setMentorTeams(teamRes.teams);
        }
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTeamCheckToggle = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId) 
        : [...prev, teamId]
    );
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      return toast.error('Title and Content are required');
    }

    try {
      setSubmitting(true);
      let res;
      if (user.role === 'mentor') {
        if (selectedTeams.length === 0) {
          setSubmitting(false);
          return toast.error('Please select at least one target team');
        }
        const { data } = await api.post('/api/mentor/announcements', { 
          title, 
          content, 
          teamIds: selectedTeams 
        });
        res = data;
      }

      if (res && res.success) {
        toast.success('Announcement published successfully');
        setShowCreateModal(false);
        setTitle('');
        setContent('');
        setSelectedTeams([]);
        loadAnnouncements();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const deleteEndpoint = user.role === 'mentor' ? `/api/mentor/announcements/${id}` : `/api/admin/announcements/${id}`;
      const { data: res } = await api.delete(deleteEndpoint);
      if (res.success) {
        toast.success('Announcement deleted');
        loadAnnouncements();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const roleLabels = {
    admin: 'System Admin',
    mentor: 'Mentor'
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Broadcast notice boards and project guidelines.</p>
        </div>
        {user.role === 'mentor' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <FiPlusCircle /> New Announcement
          </button>
        )}
      </div>

      {/* Announcements cards */}
      <div className="space-y-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((a) => (
            <div key={a._id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative">
              
              <div className="flex justify-between items-start pr-8">
                <div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase mr-2 ${
                    a.scope === 'all' 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                  }`}>
                    {a.scope === 'all' ? 'Global Broadcast' : 'Team Specific'}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white font-poppins text-sm mt-2">{a.title}</h3>
                </div>
                
                {/* Delete button (Admin can delete all, Mentor can delete own - for simplicity button only shown for admins here, or mentors if they are the creator) */}
                {(user.role === 'admin' || (user.role === 'mentor' && a.createdBy?._id === user._id)) && (
                  <button
                    onClick={() => handleDeleteAnnouncement(a._id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors absolute top-4 right-4"
                    title="Delete Announcement"
                  >
                    <FiTrash2 size={15} />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal whitespace-pre-wrap">{a.content}</p>

              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="flex items-center gap-1"><FiUser /> Posted By: {a.createdBy?.name || 'Unknown'} ({roleLabels[a.createdBy?.role] || a.createdBy?.role})</span>
                <span className="flex items-center gap-1"><FiCalendar /> {new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <FiBell size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-500 font-medium">No announcements published.</p>
          </div>
        )}
      </div>

      {/* Modal for Creating Announcement */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2"><FiMegaphone className="text-primary" /> Publish Announcement</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={18} /></button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Interim Evaluation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-505 mb-1 uppercase tracking-wide">Notice Content *</label>
                <textarea
                  required
                  placeholder="Enter evaluation guidelines, schedules, or notifications details..."
                  value={content}
                  rows={5}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                />
              </div>

              {/* Mentor target team selection */}
              {user.role === 'mentor' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-505 mb-1.5 uppercase tracking-wide">Select Target Teams *</label>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 max-h-32 overflow-y-auto space-y-2">
                    {mentorTeams.map((team) => (
                      <label key={team._id} className="flex items-center gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-350">
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team._id)}
                          onChange={() => handleTeamCheckToggle(team._id)}
                          className="rounded border-slate-300 text-primary cursor-pointer"
                        />
                        <span>{team.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-80 transition-all duration-200 text-xs"
              >
                {submitting ? <Spinner size="sm" color="white" /> : 'Publish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
