import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiSend, FiPaperclip, FiX, FiFile, FiImage } from 'react-icons/fi';

const TeamChat = () => {
  const { user } = useAuth();
  const { joinRoom, sendMessage, socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  
  // Mentors can supervise multiple teams, let them choose which team chat to join
  const [mentorTeams, setMentorTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  const messagesEndRef = useRef(null);

  const loadChatHistory = async (teamId) => {
    try {
      setLoading(true);
      const { data: res } = await api.get(`/api/chat/${teamId}`);
      if (res.success) {
        setMessages(res.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      if (!user) return;

      if (user.role === 'mentor') {
        // Load mentor's supervised teams so they can select one
        try {
          const { data: teamRes } = await api.get('/api/mentor/teams');
          if (teamRes.success) {
            setMentorTeams(teamRes.teams);
            if (teamRes.teams.length > 0) {
              const defaultTeamId = teamRes.teams[0]._id;
              setSelectedTeamId(defaultTeamId);
              joinRoom(defaultTeamId);
              loadChatHistory(defaultTeamId);
            } else {
              setLoading(false);
            }
          }
        } catch (err) {
          console.error(err);
        }
      } else if (user.team) {
        // Leader and Member join their own team room directly
        const teamId = typeof user.team === 'object' ? user.team._id : user.team;
        setSelectedTeamId(teamId);
        joinRoom(teamId);
        loadChatHistory(teamId);
      } else {
        setLoading(false);
      }
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for real-time messages broadcasted from Socket.io server
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        // Only append message if it belongs to currently selected team chat
        if (message.team === selectedTeamId) {
          setMessages((prev) => [...prev, message]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
      }
    };
  }, [socket, selectedTeamId]);

  // Auto scroll to bottom when messages load/change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMentorTeamChange = (e) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    joinRoom(teamId);
    loadChatHistory(teamId);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Direct upload on selection
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingFile(true);
      const { data: res } = await api.post('/api/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        setAttachedFile(res.file); // Stash uploaded file details (name, path, fileType)
        toast.success(`Attached: ${file.name}`);
      }
    } catch (err) {
      toast.error('Attachment failed. Only PDFs and Images (max 10MB) allowed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !attachedFile) return;

    // Emit message to Socket server
    sendMessage(selectedTeamId, user._id, text.trim(), attachedFile);
    
    // Clear input bar and attachments
    setText('');
    setAttachedFile(null);
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedTeamId) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <FiMessageSquare size={32} className="mx-auto text-slate-400 mb-2" />
        <h3 className="font-bold text-slate-800 dark:text-white font-poppins">No Active Chat Room</h3>
        <p className="text-xs text-slate-500 mt-1">You must belong to a team or supervises teams to use the chat room.</p>
      </div>
    );
  }

  const roleColors = {
    admin: 'text-red-500 bg-red-500/10',
    mentor: 'text-purple-500 bg-purple-500/10',
    leader: 'text-blue-500 bg-blue-500/10',
    member: 'text-emerald-500 bg-emerald-500/10'
  };

  const roleLabels = {
    admin: 'Admin',
    mentor: 'Mentor',
    leader: 'TL',
    member: 'Member'
  };

  return (
    <div className="h-[75vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm max-w-5xl mx-auto">
      
      {/* Chat Room Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiMessageSquare size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-white font-poppins">Real-time Team Workspace Chat</h2>
            <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider">real-time sync active</span>
          </div>
        </div>

        {/* Mentor Supervised Teams Dropdown */}
        {user.role === 'mentor' && (
          <select
            value={selectedTeamId}
            onChange={handleMentorTeamChange}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-bold focus:outline-none dark:text-white"
          >
            {mentorTeams.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
        {messages && messages.length > 0 ? (
          messages.map((m, idx) => {
            const isMe = m.sender?._id === user._id;
            const fileDlUrl = m.file?.path ? (window.location.hostname === 'localhost' ? `http://localhost:5000${m.file.path}` : m.file.path) : null;
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Sender Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-650 dark:text-slate-200 flex-shrink-0">
                  {m.sender?.name ? m.sender.name[0].toUpperCase() : 'U'}
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  {/* Sender Details */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500 pl-1">
                      <span>{m.sender?.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold ${roleColors[m.sender?.role]}`}>
                        {roleLabels[m.sender?.role]}
                      </span>
                    </div>
                  )}

                  <div className={`p-3 rounded-2xl text-xs space-y-2 leading-relaxed ${
                    isMe 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 rounded-tl-none shadow-sm'
                  }`}>
                    {/* Text content */}
                    {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}

                    {/* File Attachment details */}
                    {fileDlUrl && (
                      <div className={`p-2 rounded-xl border flex items-center gap-2 max-w-xs ${
                        isMe 
                          ? 'bg-blue-600/40 border-blue-500 text-blue-50' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200/40 text-slate-700 dark:text-slate-300'
                      }`}>
                        {m.file.fileType === 'image' ? (
                          <div className="space-y-1">
                            <img src={fileDlUrl} alt="Attached Deliverable" className="rounded-lg max-h-36 max-w-full object-cover shadow-inner" />
                            <a href={fileDlUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold block hover:underline truncate">{m.file.name}</a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FiFile className="text-red-500 flex-shrink-0" size={16} />
                            <a href={fileDlUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold hover:underline truncate">{m.file.name}</a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className={`text-[8px] text-slate-400 font-medium block pl-1 ${isMe ? 'text-right' : ''}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center">
            <FiMessageSquare size={36} className="text-slate-300 dark:text-slate-700 mb-2 animate-bounce" />
            <p className="text-xs font-semibold">Welcome to the Team Chat Room</p>
            <p className="text-[10px]">Send messages or share project files with your team.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Pre-drawer */}
      {attachedFile && (
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between animate-fade-in text-xs font-bold text-slate-650 dark:text-slate-350">
          <div className="flex items-center gap-2">
            {attachedFile.fileType === 'image' ? <FiImage className="text-accent" /> : <FiFile className="text-red-500" />}
            <span className="truncate max-w-xs">{attachedFile.name}</span>
          </div>
          <button 
            onClick={handleRemoveAttachment}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20 flex gap-2.5 items-center">
        {/* Attachment button */}
        <label className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 text-slate-500 hover:text-primary cursor-pointer flex-shrink-0 transition-all">
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploadingFile}
          />
          {uploadingFile ? <Spinner size="sm" /> : <FiPaperclip size={16} />}
        </label>

        {/* Input Text Box */}
        <input
          type="text"
          placeholder="Write message here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700/80 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 dark:text-white"
        />

        {/* Send Button */}
        <button
          type="submit"
          className="p-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
        >
          <FiSend size={16} />
        </button>
      </form>

    </div>
  );
};

export default TeamChat;
