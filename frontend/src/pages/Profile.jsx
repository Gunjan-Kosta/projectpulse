import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { FiUser, FiMail, FiShield, FiTag, FiBriefcase, FiUsers } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data } = await api.get('/api/auth/profile');
        if (data.success) {
          setProfile(data.user);
        }
      } catch (error) {
        console.error('Error loading profile info:', error);
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const roleLabels = {
    admin: 'System Administrator',
    mentor: 'Mentor / Faculty Supervisor',
    leader: 'Team Leader',
    member: 'Team Member'
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Manage your personal identification details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-extrabold mb-4 shadow-sm">
            {profile?.name ? profile.name[0].toUpperCase() : 'U'}
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white font-poppins">{profile?.name}</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">{profile?.userId}</p>

          <span className="mt-4 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase border border-primary/20">
            {profile?.role}
          </span>
        </div>

        {/* Details Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 uppercase tracking-wider">Account Credentials</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <FiUser size={16} />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-505 block">Full Name</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <FiMail size={16} />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-505 block">Email Address</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <FiTag size={16} />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-505 block">User Identifier</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile?.userId}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <FiShield size={16} />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-505 block">Role Access</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{roleLabels[profile?.role]}</span>
              </div>
            </div>
          </div>

          {/* Team and Project details if Member/Leader */}
          {profile?.team && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white uppercase tracking-wider">Group Assignment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Assigned Team</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile.team.name}</span>
                  </div>
                </div>

                {profile.team.project && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                      <FiBriefcase size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block">Assigned Project</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile.team.project.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
