import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff, FiActivity, FiKey } from 'react-icons/fi';
import Spinner from '../components/Spinner';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      emailOrId: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const result = await login(data.emailOrId, data.password);
    setSubmitting(false);
    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  // Quick login helper
  const handleQuickLogin = (email, pass) => {
    setValue('emailOrId', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-lg shadow-primary/20">
              <FiActivity className="text-white text-xl animate-pulse" />
            </div>
            <span className="font-poppins font-bold text-2xl tracking-wider text-slate-900 dark:text-white">Project<span className="text-primary">Pulse</span></span>
          </Link>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest font-poppins">System Access Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-100 dark:shadow-none">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-poppins mb-2">Welcome Back</h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">Enter your credentials to log in or use the quick fill options below.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
            {/* User ID / Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email Address or User ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiMail size={16} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. admin@projectpulse.com or PP-1001"
                  {...register('emailOrId', { required: 'Email address or User ID is required' })}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border text-sm focus:outline-none focus:ring-2 transition-all dark:bg-slate-800 dark:text-white ${
                    errors.emailOrId 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-200 focus:border-primary focus:ring-primary/10 dark:border-slate-700/80'
                  }`}
                />
              </div>
              {errors.emailOrId && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.emailOrId.message}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiLock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  {...register('password', { required: 'Password is required' })}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border text-sm focus:outline-none focus:ring-2 transition-all dark:bg-slate-800 dark:text-white ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-200 focus:border-primary focus:ring-primary/10 dark:border-slate-700/80'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-75 transition-all duration-200 mt-2 text-sm"
            >
              {submitting ? <Spinner size="sm" color="white" /> : 'Log In'}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              <FiKey className="text-primary" /> Admin Quick Fill
            </span>
            <div className="flex gap-2.5">
              <button
                onClick={() => handleQuickLogin('admin@projectpulse.com', 'admin123')}
                className="flex-1 py-2 px-3 text-left rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between"
              >
                <span>System Admin</span>
                <span className="text-[10px] text-primary bg-primary/10 py-0.5 px-1.5 rounded-md uppercase font-bold">Admin</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 text-center">
              Other roles (Mentor, Leader, Member) accounts are created by the Admin. Passwords reset to <code className="text-primary font-mono">Pulse@123</code>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
