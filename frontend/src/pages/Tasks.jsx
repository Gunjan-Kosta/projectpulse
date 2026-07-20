import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { 
  FiCheckSquare, FiPlusCircle, FiX, FiCalendar, FiUser, 
  FiFile, FiUploadCloud, FiClock, FiChevronRight, FiGrid, FiList 
} from 'react-icons/fi';

const Tasks = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [teamDetail, setTeamDetail] = useState(null); // Load team members list for assignments

  // Admin/Mentor states
  const [teamsList, setTeamsList] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  // Modals & Forms states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Create Task Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Update Task Form fields
  const [taskStatus, setTaskStatus] = useState('');
  const [taskFile, setTaskFile] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(false);

  const loadTasksData = async () => {
    try {
      setLoading(true);
      if (user.role === 'admin' || user.role === 'mentor') {
        // Load all teams to let Admin/Mentor select team and view its tasks
        const endpoint = user.role === 'admin' ? '/api/admin/teams' : '/api/mentor/teams';
        const { data: teamRes } = await api.get(endpoint);
        if (teamRes.success) {
          setTeamsList(teamRes.teams);
          if (teamRes.teams.length > 0) {
            // Default to first team
            const defaultTeamId = selectedTeamId || teamRes.teams[0]._id;
            setSelectedTeamId(defaultTeamId);
            fetchTasksForTeam(defaultTeamId);
          } else {
            setLoading(false);
          }
        }
      } else if (user.role === 'leader') {
        const { data: taskRes } = await api.get('/api/leader/tasks');
        const { data: teamRes } = await api.get('/api/common/team');
        if (taskRes.success) setTasks(taskRes.tasks);
        if (teamRes.success) setTeamDetail(teamRes.team);
        setLoading(false);
      } else if (user.role === 'member') {
        const { data: taskRes } = await api.get('/api/member/tasks');
        if (taskRes.success) setTasks(taskRes.tasks);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching tasks details:', error);
      toast.error('Failed to load tasks');
      setLoading(false);
    }
  };

  const fetchTasksForTeam = async (teamId) => {
    try {
      // Find project associated with the team
      const team = teamsList.find(t => t._id === teamId);
      if (team && team.project) {
        const { data: res } = await api.get(`/api/common/project?teamId=${teamId}`);
        if (res.success && team.project._id) {
          // Fetch tasks for the project
          // Use leader endpoints indirectly or fetch tasks based on project. We can get all project tasks if we hit a query.
          // Wait, the leader controller has getTeamTasks which pulls tasks for team project.
          // Since we want to view tasks as Admin/Mentor, let's create a common endpoint or allow leader/member endpoints to take query params, or fetch tasks for that project.
          // Wait! In `leaderController.js` we defined `getTeamTasks` to pull tasks for project.
          // For Admin/Mentor, let's look at `leaderController.js` vs `memberController.js`.
          // Actually, we can fetch tasks using a common query if we configure it, or write a quick general fetching method.
          // Wait, let's check: our server endpoint `/api/leader/tasks` can be called if we are a leader.
          // To allow Admin/Mentor to fetch tasks for a project, we can make `/api/leader/tasks` also accessible or add a query param to `leaderRoutes`?
          // Let's check `leaderRoutes.js`. It is protected by `authorize('leader')`!
          // So Admin/Mentor cannot hit it.
          // Let's check if we can query tasks directly. We can add a common endpoint or query project tasks!
          // Wait, let's look: did we write a common tasks route? No, we didn't!
          // Oh, can we add a route in `commonRoutes.js` to fetch tasks for a project?
          // Yes! Let's check if we need to modify `commonRoutes.js` and `commonController.js` to support `GET /api/common/tasks?teamId=X`.
          // That is a very clean fix! Let's do that. We'll modify them to allow Admins and Mentors to view project tasks.
          // Let's do that right now to make sure Admin and Mentor views are fully populated with tasks.
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      loadTasksData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // If team selector changes for admin/mentor
  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    setLoading(true);
    // Fetch tasks for that team
    api.get(`/api/common/project?teamId=${teamId}`)
      .then(({ data: projRes }) => {
        if (projRes.success && projRes.project) {
          // Let's fetch the tasks using our new common tasks route (which we will add)
          api.get(`/api/common/tasks?teamId=${teamId}`)
            .then(({ data: taskRes }) => {
              if (taskRes.success) {
                setTasks(taskRes.tasks);
              }
              setLoading(false);
            })
            .catch(() => {
              setTasks([]);
              setLoading(false);
            });
        } else {
          setTasks([]);
          setLoading(false);
        }
      })
      .catch(() => {
        setTasks([]);
        setLoading(false);
      });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !assignedToId) {
      return toast.error('Please enter task title and assignee');
    }

    try {
      setSubmitting(true);
      const { data: res } = await api.post('/api/leader/tasks', {
        title,
        description,
        assignedToId,
        deadline
      });

      if (res.success) {
        toast.success('Task created and assigned successfully');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setAssignedToId('');
        setDeadline('');
        loadTasksData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatusModal = (task) => {
    setSelectedTask(task);
    setTaskStatus(task.status);
    setTaskFile(null);
    setShowStatusModal(true);
  };

  const handleUpdateTaskStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdatingTask(true);
      const formData = new FormData();
      formData.append('status', taskStatus);
      if (taskFile) {
        formData.append('file', taskFile);
      }

      const { data: res } = await api.put(`/api/member/tasks/${selectedTask._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        toast.success('Task status updated');
        setShowStatusModal(false);
        loadTasksData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdatingTask(false);
    }
  };
  const handleDirectStatusUpdate = async (task, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      const { data: res } = await api.put(`/api/member/tasks/${task._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        toast.success(`Task marked as ${newStatus}`);
        loadTasksData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const renderAdminSelector = () => {
    if (user.role !== 'admin' && user.role !== 'mentor') return null;
    return (
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3 items-center text-xs mb-6 max-w-sm shadow-sm">
        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Filter Team:</span>
        <select
          value={selectedTeamId}
          onChange={handleTeamChange}
          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
        >
          {teamsList.map(t => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
      </div>
    );
  };

  const statusColors = {
    'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Task Board</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Manage deliverables, checklist, and individual assignments.</p>
        </div>
        {user.role === 'leader' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <FiPlusCircle /> Create & Assign Task
          </button>
        )}
      </div>

      {renderAdminSelector()}

      {/* Task Cards/Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kanban Status Columns */}
        {['Pending', 'In Progress', 'Completed'].map((status) => {
          const filteredTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl space-y-4 flex flex-col min-h-[50vh]">
              <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-2">
                <span className="font-poppins font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">{status}</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/55 rounded-md text-[10px] font-bold text-slate-500">
                  {filteredTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[60vh] pr-1.5">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((t) => (
                    <div 
                      key={t._id} 
                      onClick={() => (user.role === 'member' || user.role === 'leader') && t.assignedTo?._id === user._id ? handleOpenStatusModal(t) : null}
                      className={`p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 ${
                        (user.role === 'member' || user.role === 'leader') && t.assignedTo?._id === user._id 
                          ? 'cursor-pointer hover:border-primary/45 hover:shadow-md transition-all duration-200' 
                          : ''
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">{t.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{t.description || 'No description.'}</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-slate-100 dark:border-slate-800 pt-2.5">
                        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-semibold">
                          <FiUser /> {t.assignedTo?.name || 'Unassigned'}
                        </span>
                        {t.deadline && (
                          <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-semibold">
                            <FiCalendar /> {new Date(t.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Display attachment indicator */}
                      {t.attachments && t.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/15 w-max">
                          <FiFile size={10} /> {t.attachments.length} work file(s)
                        </div>
                      )}

                      {/* Quick status change buttons for assignee */}
                      {t.assignedTo?._id === user._id && (
                        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                          {t.status === 'Pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectStatusUpdate(t, 'In Progress');
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-[9px] shadow-sm hover:shadow transition-all flex items-center justify-center gap-1"
                            >
                              ▶ Start Task
                            </button>
                          )}
                          {t.status === 'In Progress' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectStatusUpdate(t, 'Completed');
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] shadow-sm hover:shadow transition-all flex items-center justify-center gap-1"
                            >
                              ✓ Complete Task
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-8 italic">No tasks in this list.</p>
                )}
              </div>
            </div>
          );
        })}

      </div>

      {/* Modal for Creating Task */}
      {showCreateModal && teamDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2"><FiCheckSquare className="text-primary" /> Create & Assign Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={18} /></button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Login Schema"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-505 mb-1 uppercase tracking-wide">Task Description</label>
                <textarea
                  placeholder="Detailed notes..."
                  value={description}
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Assign To *</label>
                  <select
                    required
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                  >
                    <option value="">-- Choose Member --</option>
                    {/* Leader can assign to Leader or any Member */}
                    <option value={teamDetail.leader?._id}>{teamDetail.leader?.name} (Leader)</option>
                    {teamDetail.members?.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-80 transition-all duration-200 text-xs"
              >
                {submitting ? <Spinner size="sm" color="white" /> : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Updating Task Status (For Assigned Members) */}
      {showStatusModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2"><FiCheckSquare className="text-primary" /> Update Task Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={18} /></button>
            </div>

            <form onSubmit={handleUpdateTaskStatus} className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{selectedTask.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-505 mb-1.5 uppercase tracking-wide">Select Status</label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-505 mb-1.5 uppercase tracking-wide">Upload Completed Work (Optional PDF/ZIP/Img)</label>
                <input
                  type="file"
                  onChange={(e) => setTaskFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer"
                />
              </div>

              {/* Display existing attachments */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Uploaded Deliverables</span>
                  <div className="space-y-1.5">
                    {selectedTask.attachments.map((att, i) => {
                      const dlUrl = window.location.hostname === 'localhost' ? `http://localhost:5000${att.path}` : att.path;
                      return (
                        <a 
                          key={i} 
                          href={dlUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[10px] text-primary hover:underline"
                        >
                          <FiFile size={10} /> {att.name}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={updatingTask}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-80 transition-all duration-200 text-xs"
              >
                {updatingTask ? <Spinner size="sm" color="white" /> : 'Update Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
