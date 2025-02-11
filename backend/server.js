import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let tasks = [
  { id: 1, title: 'Do Manual QA', description: 'Test the main features', priority: 'high', completed: false, dueDate: '2024-10-15' },
  { id: 2, title: 'Create automated tests', description: 'Create automated test for backend and frontend', priority: 'medium', completed: false, dueDate: '2024-11-01' },
];

app.get('/api/tasks', (req, res) => {
  const sortedTasks = tasks.sort((a, b) => a.priority.localeCompare(b.priority));
  res.json(sortedTasks);
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority,
    completed: false,
    dueDate: req.body.dueDate,
  };
  

  const currentDate = new Date();
  const dueDate = new Date(newTask.dueDate);
  if (dueDate < currentDate) {
    console.log('Warning: Task created with a past due date');
  }
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = req.body.completed;
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    res.json(task);
  } else {
    res.status(404).send('Task not found');
  }
});

// Delete Tasks
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Task not found');
  }
});

app.get('/api/tasks/completed', (req, res) => {
  res.json([]);
});

// Get tasks by priority
app.get('/api/tasks/priority/:priority', (req, res) => {
  const priority = req.params.priority;
  const filteredTasks = tasks.filter(task => task.priority === priority);
  res.json(filteredTasks);
});

app.get('/api/tasks/due-date', (req, res) => {
  const { start, end } = req.query;
  const filteredTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= new Date(start) && dueDate <= new Date(end);
  });
  res.json(filteredTasks);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});