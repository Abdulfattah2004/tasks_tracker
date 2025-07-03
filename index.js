const express = require('express');
const tasksRouter = require('./routes/tasks');
const app = express();
app.use(express.json());
app.use('/api/tasks', tasksRouter);
app.listen(3000, ()=>console.log('API on :3000'));
