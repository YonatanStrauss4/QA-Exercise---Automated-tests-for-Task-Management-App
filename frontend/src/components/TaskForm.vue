<template>
  <form @submit.prevent="submitTask" class="task-form">
    <input v-model="task.title" placeholder="Task title" required>
    <textarea v-model="task.description" placeholder="Task description"></textarea>
    <select v-model="task.priority">
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    <input type="date" v-model="task.dueDate">
    <button type="submit">Add Task</button>
  </form>
</template>

<script>
export default {
  name: 'TaskForm',
  data() {
    return {
      task: {
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
      },
    };
  },
  methods: {
    submitTask() {
      this.$emit('add-task', { ...this.task });
      // Bug 5: Form is not reset after submission
    },
  },
};
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.task-form input, .task-form textarea, .task-form select {
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #bdc3c7;
  border-radius: 3px;
}

.task-form button {
  padding: 10px;
  background-color: #2ecc71;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 3px;
}

.task-form button:hover {
  background-color: #27ae60;
}
</style>