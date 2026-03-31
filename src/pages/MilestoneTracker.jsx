import React, { useState } from 'react';
import { Flag, CheckCircle, Clock, AlertCircle, Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';

const mockProjects = [
  {
    id: 1,
    name: 'IT Equipment Supply',
    client: 'Ministry of Education',
    status: 'In Progress',
    progress: 65,
    milestones: [
      { id: 1, title: 'Contract Signed', completed: true, dueDate: '2026-01-15', completedDate: '2026-01-15' },
      { id: 2, title: 'Equipment Ordered', completed: true, dueDate: '2026-02-01', completedDate: '2026-01-28' },
      { id: 3, title: 'First Delivery', completed: true, dueDate: '2026-03-01', completedDate: '2026-02-28' },
      { id: 4, title: 'Installation Complete', completed: false, dueDate: '2026-04-01', completedDate: null },
      { id: 5, title: 'Training Conducted', completed: false, dueDate: '2026-04-15', completedDate: null },
      { id: 6, title: 'Final Handover', completed: false, dueDate: '2026-05-01', completedDate: null },
    ]
  },
  {
    id: 2,
    name: 'Office Renovation',
    client: 'State Trading Organization',
    status: 'In Progress',
    progress: 40,
    milestones: [
      { id: 1, title: 'Design Approval', completed: true, dueDate: '2026-02-01', completedDate: '2026-01-30' },
      { id: 2, title: 'Permits Obtained', completed: true, dueDate: '2026-02-15', completedDate: '2026-02-14' },
      { id: 3, title: 'Demolition', completed: false, dueDate: '2026-03-01', completedDate: null },
      { id: 4, title: 'Construction', completed: false, dueDate: '2026-05-01', completedDate: null },
      { id: 5, title: 'Finishing', completed: false, dueDate: '2026-06-01', completedDate: null },
    ]
  },
];

export default function MilestoneTracker() {
  const [projects, setProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [showAdd, setShowAdd] = useState(false);

  const toggleMilestone = (milestoneId) => {
    setProjects(projects.map(p => {
      if (p.id === selectedProject.id) {
        const updatedMilestones = p.milestones.map(m => {
          if (m.id === milestoneId) {
            return { 
              ...m, 
              completed: !m.completed,
              completedDate: !m.completed ? new Date().toISOString().split('T')[0] : null
            };
          }
          return m;
        });
        const completed = updatedMilestones.filter(m => m.completed).length;
        const progress = Math.round((completed / updatedMilestones.length) * 100);
        return { ...p, milestones: updatedMilestones, progress };
      }
      return p;
    }));
    
    // Update selected project too
    const updated = projects.find(p => p.id === selectedProject.id);
    if (updated) {
      const updatedMilestones = updated.milestones.map(m => {
        if (m.id === milestoneId) {
          return { 
            ...m, 
            completed: !m.completed,
            completedDate: !m.completed ? new Date().toISOString().split('T')[0] : null
          };
        }
        return m;
      });
      const completed = updatedMilestones.filter(m => m.completed).length;
      const progress = Math.round((completed / updatedMilestones.length) * 100);
      setSelectedProject({ ...updated, milestones: updatedMilestones, progress });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'At Risk': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Milestone Tracker</h1>
          <p className="text-gray-500 mt-1">Track project phases and deliverables</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1 space-y-4">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`card cursor-pointer transition-all ${selectedProject.id === project.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{project.client}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      project.progress === 100 ? 'bg-emerald-500' : 
                      project.progress > 50 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {project.milestones.filter(m => m.completed).length} / {project.milestones.length}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                <p className="text-gray-500">{selectedProject.client}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{selectedProject.progress}%</p>
                <p className="text-sm text-gray-500">Complete</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedProject.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => toggleMilestone(milestone.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        milestone.completed 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                      }`}
                    >
                      {milestone.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm">{index + 1}</span>}
                    </button>
                    {index < selectedProject.milestones.length - 1 && (
                      <div className={`w-0.5 h-12 my-1 ${milestone.completed ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  
                  <div className={`flex-1 pb-6 ${milestone.completed ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${milestone.completed ? 'line-through' : ''}`}>
                        {milestone.title}
                      </h4>
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className={`flex items-center gap-1 ${milestone.completed ? 'text-emerald-600' : 'text-gray-500'}`}>
                        <Clock className="w-4 h-4" />
                        Due: {milestone.dueDate}
                      </span>
                      {milestone.completedDate && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          Completed: {milestone.completedDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add Milestone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
