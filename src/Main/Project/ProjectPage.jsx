import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, ChevronRight, Activity, 
  X, Save, Briefcase, User, Hash, PenTool
} from 'lucide-react';
import { projectsData, formatRupiah, calculateProjectTotal } from '../../data/mockData';
import MobileHeader from '../../components/MobileHeader';

const ProjectPage = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newProject, setNewProject] = useState({
    jobNo: '',
    projectName: '',
    customer: '',
    creator: '' 
  });

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      console.log("Data Tersimpan:", newProject);
      setLoading(false);
      setIsModalOpen(false);
      setNewProject({ jobNo: '', projectName: '', customer: '', creator: '' });
    }, 1000);
  };

  const filteredProjects = projectsData.filter(p => 
    p.jobNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.namaProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Projects" />
      
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Hello, Wawan 👋</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 flex items-center gap-2 text-sm">
                <Activity size={16} className="text-blue-500"/> 
                Status: <span className="text-green-600 dark:text-green-400 font-bold text-xs bg-green-100 dark:bg-green-900/30 px-2 rounded-full">Optimal</span>
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-blue-700/20 flex items-center justify-center gap-2"
            >
              <Plus size={20} strokeWidth={3} /> New Project
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto -mt-4 sm:-mt-8 pb-6">
          
          {/* Search Bar */}
          <div className="p-4 sm:p-5 rounded-xl shadow-sm mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3 sm:gap-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Projects</h2>
              <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <strong>{filteredProjects.length}</strong> jobs
              </span>
            </div>
            
            <div className="relative w-full sm:w-[300px]">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              />
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate('/project-detail')}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 active:bg-slate-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded border text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800">
                    {project.jobNo}
                  </span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">{project.namaProject}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{project.customer}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatRupiah(calculateProjectTotal(project))}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {project.pembuat.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500">{project.lastEditDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-xl shadow-sm overflow-hidden mb-6 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b bg-slate-50/60 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                    {['Job No', 'Project Name', 'Customer', 'Total Value', 'Creator', 'Last Update', ''].map((head) => (
                      <th key={head} className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 lg:px-6 py-4">
                        <span className="font-mono text-sm font-bold px-2 py-1 rounded border text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800">
                          {project.jobNo}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{project.namaProject}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {project.customer.charAt(0)}
                          </div>
                          {project.customer}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm">{formatRupiah(calculateProjectTotal(project))}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            {project.pembuat.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{project.pembuat.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-slate-500">{project.lastEditDate}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <button 
                          onClick={() => navigate('/project-detail')}
                          className="p-2 rounded-lg border border-transparent text-blue-600 hover:bg-blue-50 hover:border-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-4 lg:px-6 py-4 border-t flex items-center justify-between text-sm font-medium border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
              <span className="text-xs">Showing 1-{filteredProjects.length} of {filteredProjects.length}</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded text-xs bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700">Prev</button>
                <button className="px-3 py-1 bg-blue-700 text-white rounded shadow-sm text-xs">1</button>
                <button className="px-3 py-1 border rounded text-xs bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 sticky top-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Add New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Hash size={16} className="text-blue-500"/> Job No <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" name="jobNo" required 
                  placeholder="JOB-202X-XXX" 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  value={newProject.jobNo} onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Briefcase size={16} className="text-orange-500"/> Project Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" name="projectName" required 
                  placeholder="e.g. System Upgrade" 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProject.projectName} onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User size={16} className="text-green-500"/> Customer <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" name="customer" required 
                  placeholder="Client Name" 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProject.customer} onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <PenTool size={16} className="text-purple-500"/> Creator
                </label>
                <input 
                  type="text" name="creator" placeholder="Created By" 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProject.creator} onChange={handleChange}
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`px-5 sm:px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-md flex items-center gap-2 ${loading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? 'Saving...' : <><Save size={18} /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
