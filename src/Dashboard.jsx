import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // Fetch list of projects from the projects folder
      const response = await fetch('/projects/index.json');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.log('No projects found or error loading projects:', error);
      setProjects([]);
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      name: projectName,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    };

    try {
      // Save the project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setProjectName('');
        // Navigate to the project
        navigate(`/project/${newProject.id}`);
      } else {
        alert('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Check console for details.');
    }
  };

  const openProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Projects</h1>
        <button
          className="create-project-button"
          onClick={() => setShowCreateModal(true)}
        >
          Create Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>No projects yet. Create your first project!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => openProject(project.id)}
            >
              <h3>{project.name}</h3>
              <p className="project-date">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <p className="project-stats">
                Nodes: {project.nodes?.length || 0} | Edges:{' '}
                {project.edges?.length || 0}
              </p>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="project-name-input"
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={createProject} className="primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
