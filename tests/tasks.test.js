const request = require('supertest');
const express = require('express');
const tasksRouter = require('../routes/tasks');


jest.mock('../db', () => ({
  query: jest.fn()
}));
const pool = require('../db');

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);

describe('Tasks API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /tasks returns all tasks', async () => {
    const mockRows = [[{ id: 1, title: 'Test task', completed: 0 }]];
    pool.query.mockResolvedValueOnce(mockRows);

    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRows[0]);
  });

  test('POST /tasks adds a task', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 123 }]);

    const res = await request(app)
      .post('/tasks')
      .send({ title: 'New Task' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 123, title: 'New Task' });
  });

  test('DELETE /tasks/:id deletes task if found', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/tasks/1');
    expect(res.status).toBe(204);
  });

  test('PUT /tasks/:id fully updates task', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/tasks/1')
      .send({ title: 'Updated Task', completed: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Task fully updated' });
  });

  test('PATCH /tasks/:id partially updates task', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .patch('/tasks/1')
      .send({ completed: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Task partially updated' });
  });
});
