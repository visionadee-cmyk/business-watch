import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FileSpreadsheet, TrendingUp, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Simple query without composite index requirements
      const snapshot = await getDocs(collection(db, 'excelProjects'));
      // Sort client-side
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.sheetName?.localeCompare(b.sheetName));
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-warning-600" />;
      case 'Pending': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default: return <FileSpreadsheet className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success-100 text-success-700';
      case 'In Progress': return 'bg-warning-100 text-warning-700';
      case 'Pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalValue = projects.reduce((sum, p) => sum + (p.projectValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <img 
            src="/illustrations/Work%20time-amico.svg" 
            alt="Projects" 
            className="w-16 h-16 object-contain"
            onError={(e) => { e.target.style.display='none'; }}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">Project sheets</p>
          </div>
        </div>
        <div className="card px-6 py-3 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary-600" />
          <div>
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="text-xl font-bold text-gray-900">MVR {totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.sheetName}</h3>
                    <p className="text-sm text-gray-500">{project.projectName}</p>
                  </div>
                </div>
                {getStatusIcon(project.status)}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Project Value</span>
                  <span className="font-semibold text-gray-900">MVR {(project.projectValue || 0).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.projectName}</h2>
                <p className="text-gray-500">{selectedProject.sheetName}</p>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Project Value</p>
                <p className="text-xl font-bold text-primary-600">MVR {(selectedProject.projectValue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="text-lg font-semibold">{selectedProject.status}</p>
              </div>
            </div>

            {selectedProject.financialData && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Financial Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Deduction</span>
                    <span className="font-medium">MVR {(selectedProject.financialData.deduction || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-medium">MVR {(selectedProject.financialData.paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Total Cost</span>
                    <span className="font-medium">MVR {(selectedProject.financialData.totalCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Total Profit</span>
                    <span className="font-medium text-success-600">MVR {(selectedProject.financialData.totalProfit || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
