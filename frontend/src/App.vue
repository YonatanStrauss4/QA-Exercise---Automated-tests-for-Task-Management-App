<template>
  <div id="app">
    <h1>Simple Task Manager</h1>
    <task-form @add-task="addTask"></task-form>
    <div class="filters">
      <button @click="filterTasks('all')" :class="{ active: filter === 'all' }">All</button>
      <button @click="filterTasks('active')" :class="{ active: filter === 'active' }">Active</button>
      <button @click="filterTasks('completed')" :class="{ active: filter === 'completed' }">Completed</button>
    </div>
    <task-list :tasks="filteredTasks" @update-task="updateTask" @delete-task="deleteTask"></task-list>
  </div>
</template>

<script>
import axios from 'axios';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';

export default {
  name: 'App',
  components: {
    TaskForm,
    TaskList,
  },
  data() {
    return {
      tasks: [],
      filter: 'all',
    };
  },
  computed: {
    filteredTasks() {
      switch (this.filter) {
        case 'active':
          return this.tasks.filter(task => !task.completed);
        case 'completed':
          return this.tasks.filter(task => task.completed);
        default:
          return this.tasks;
      }
    },
  },
  methods: {
    async fetchTasks() {
      try {
        const response = await axios.get('http://localhost:3000/api/tasks');
        this.tasks = response.data;
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    },
    async addTask(task) {
      try {
        const response = await axios.post('http://localhost:3000/api/tasks', task);
        this.tasks.push(response.data);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    },
    async updateTask(task) {
      try {
        await axios.put(`http://localhost:3000/api/tasks/${task.id}`, task);
        // Bug 3: Updated task is not reflected in the UI
      } catch (error) {
        console.error('Error updating task:', error);
      }
    },
    async deleteTask(taskId) {
      try {
        await axios.delete(`http://localhost:3000/api/tasks/${taskId}`);
        this.tasks = this.tasks.filter(task => task.id !== taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    },
    filterTasks(filter) {
      this.filter = filter;
    },
  },
  mounted() {
    this.fetchTasks();
    // Bug 4: Fetching completed tasks separately, but not using the data
    axios.get('http://localhost:3000/api/tasks/completed')
      .then(response => {
        console.log('Completed tasks:', response.data);
      })
      .catch(error => {
        console.error('Error fetching completed tasks:', error);
      });
  },
};
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  text-align: center;
}

.filters {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.filters button {
  margin: 0 10px;
  padding: 5px 10px;
  border: none;
  background-color: #ecf0f1;
  color: #34495e;
  cursor: pointer;
  border-radius: 3px;
}

.filters button.active {
  background-color: #3498db;
  color: white;
}
</style>