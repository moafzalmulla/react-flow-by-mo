import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Path to projects folder
const projectsDir = join(__dirname, 'public', 'projects');

// Ensure projects directory exists
async function ensureProjectsDir() {
  if (!existsSync(projectsDir)) {
    await fs.mkdir(projectsDir, { recursive: true });
  }
}

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    await ensureProjectsDir();
    const files = await fs.readdir(projectsDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json') && file !== 'index.json');
    
    const projects = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(join(projectsDir, file), 'utf-8');
        return JSON.parse(content);
      })
    );
    
    res.json({ projects });
  } catch (error) {
    console.error('Error reading projects:', error);
    res.json({ projects: [] });
  }
});

// Create a new project
app.post('/api/projects', async (req, res) => {
  try {
    await ensureProjectsDir();
    const project = req.body;
    const filePath = join(projectsDir, `${project.id}.json`);
    
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    
    // Update index file
    await updateIndex();
    
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update an existing project
app.put('/api/projects/:id', async (req, res) => {
  try {
    await ensureProjectsDir();
    const { id } = req.params;
    const project = req.body;
    const filePath = join(projectsDir, `${id}.json`);
    
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    
    // Update index file
    await updateIndex();
    
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Update the index.json file with all projects
async function updateIndex() {
  try {
    const files = await fs.readdir(projectsDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json') && file !== 'index.json');
    
    const projects = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(join(projectsDir, file), 'utf-8');
        return JSON.parse(content);
      })
    );
    
    await fs.writeFile(
      join(projectsDir, 'index.json'),
      JSON.stringify({ projects }, null, 2)
    );
  } catch (error) {
    console.error('Error updating index:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
