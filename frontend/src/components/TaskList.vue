<template>
    <ul class="task-list">
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-header">
          <input 
            type="checkbox" 
            :checked="task.completed" 
            @change="updateTask({ ...task, completed: !task.completed })"
          >
          <span class="task-title" :class="{ completed: task.completed }">{{ task.title }}</span>
          <span class="task-priority" :class="task.priority">{{ task.priority }}</span>
        </div>
        <p class="task-description">{{ task.description }}</p>
        <div class="task-footer">
          <span>Due: {{ formatDate(task.dueDate) }}</span>
          <button @click="deleteTask(task.id)" class="delete-btn">Delete</button>
        </div>
      </li>
    </ul>
  </template>
  
  <script>
  export default {
    name: 'TaskList',
    props: ['tasks'],
    methods: {
      updateTask(task) {
        this.$emit('update-task', task);
      },
      deleteTask(taskId) {
        this.$emit('delete-task', taskId);
      },
      formatDate(dateString) {
        // Bug 6: Incorrect date format (displays MM-DD-YYYY instead of YYYY-MM-DD)
        const date = new Date(dateString);
        return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
      },
    },
  };
  </script>
  
  <style scoped>
  .task-list {
    list-style-type: none;
    padding: 0;
  }
  
  .task-item {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
    padding: 10px;
  }
  
  .task-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  
  .task-title {
    margin-left: 10px;
    flex-grow: 1;
  }
  
  .task-title.completed {
    text-decoration: line-through;
    color: #888;
  }
  
  .task-priority {
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 0.8em;
  }
  
  .task-priority.high {
    background-color: #dc3545;
    color: #fff;
  }
  
  .task-priority.medium {
    background-color: #ffc107;
    color: #000;
  }
  
  .task-priority.low {
    background-color: #28a745;
    color: #fff;
  }
  
  .task-description {
    margin: 5px 0;
    color: #666;
  }
  
  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
    font-size: 0.9em;
  }
  
  .delete-btn {
    background-color: #dc3545;
    color: #fff;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .delete-btn:hover {
    background-color: #c82333;
  }
  </style>