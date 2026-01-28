import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './ProjectFlow.css';

let nodeId = 0;

function ProjectFlow() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [projectName, setProjectName] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeColor, setNodeColor] = useState('#ffffff');
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/projects/${projectId}.json`);
      if (response.ok) {
        const project = await response.json();
        setProjectName(project.name);
        setNodes(project.nodes || []);
        setEdges(project.edges || []);
        nodeId = Math.max(...(project.nodes || []).map((n) => parseInt(n.id) || 0), 0);
      } else {
        alert('Project not found');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Error loading project');
      navigate('/dashboard');
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setNodeName(node.data.label);
    setNodeColor(node.style?.backgroundColor || '#ffffff');
  }, []);

  const addNode = () => {
    const newNode = {
      id: (++nodeId).toString(),
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodeId}` },
      style: { backgroundColor: '#ffffff', padding: 10 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNode = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: { ...node.data, label: nodeName },
            style: { ...node.style, backgroundColor: nodeColor },
          };
        }
        return node;
      })
    );
    setSelectedNode(null);
    setNodeName('');
    setNodeColor('#ffffff');
  };

  const saveProject = async () => {
    const projectData = {
      id: projectId,
      name: projectName,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        alert('Project saved successfully!');
      } else {
        alert('Failed to save project. Make sure the backend server is running on port 3001.\n\nRun: npm run server');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Cannot connect to backend server. Please ensure the server is running.\n\nRun: npm run server\n\nOr use: npm start (to run both servers)');
    }
  };

  const downloadPDF = async () => {
    if (!reactFlowWrapper.current) return;

    try {
      // Get the react flow viewport element
      const flowElement = reactFlowWrapper.current.querySelector('.react-flow__viewport');
      
      if (!flowElement) {
        alert('Flow diagram not ready');
        return;
      }

      // Create canvas from the flow element
      const canvas = await html2canvas(flowElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${projectName || 'diagram'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Check console for details.');
    }
  };

  return (
    <div className="project-flow-container">
      <div className="flow-header">
        <div>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <h2>{projectName}</h2>
        </div>
        <div className="header-buttons">
          <button onClick={addNode} className="action-button">
            Add Node
          </button>
          <button onClick={saveProject} className="action-button save">
            Save Project
          </button>
          <button onClick={downloadPDF} className="action-button download">
            Download PDF
          </button>
        </div>
      </div>

      <div className="flow-content">
        <div className="flow-canvas" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="node-editor">
            <h3>Edit Node</h3>
            <div className="editor-field">
              <label>Node Name</label>
              <input
                type="text"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder="Enter node name"
              />
            </div>
            <div className="editor-field">
              <label>Background Color</label>
              <input
                type="color"
                value={nodeColor}
                onChange={(e) => setNodeColor(e.target.value)}
              />
            </div>
            <div className="editor-buttons">
              <button onClick={updateNode} className="update-button">
                Update Node
              </button>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setNodeName('');
                  setNodeColor('#ffffff');
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectFlow;
