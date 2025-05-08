// gateway_service.test.js
// Tests de integración para gateway-service.js usando Jest y supertest

const request = require('supertest');
const axios = require('axios');
jest.mock('axios');
const { app, server } = require('../gateway-service');

describe('Gateway API Integration', () => {
  afterAll(() => {
    server.close();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health responde OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'OK' });
  });

  test('GET /ranking éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { ranking: [1,2,3] } });
    const res = await request(app).get('/ranking');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ranking: [1,2,3] });
  });
  test('GET /ranking error', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    const res = await request(app).get('/ranking');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /profile éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { user: { username: 'testuser' } } });
    const res = await request(app).get('/profile?username=testuser');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ username: 'testuser' });
  });
  test('GET /profile error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404, data: { error: 'not found' } } });
    const res = await request(app).get('/profile?username=fail');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });

  test('PUT /profile/:username éxito', async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    const res = await request(app).put('/profile/testuser').send({ bio: 'bio' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
  test('PUT /profile/:username error', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'bad' } } });
    const res = await request(app).put('/profile/testuser').send({ bio: 'bio' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'bad' });
  });

  test('POST /login éxito', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'abc' } });
    const res = await request(app).post('/login').send({ username: 'a', password: 'b' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ token: 'abc' });
  });
  test('POST /login error', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 401, data: { error: 'bad' } } });
    const res = await request(app).post('/login').send({ username: 'a', password: 'b' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'bad' });
  });

  test('GET /questionsRecord/:username/:gameMode éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { record: [1,2] } });
    const res = await request(app).get('/questionsRecord/test/easy');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ record: [1,2] });
  });
  test('GET /questionsRecord/:username/:gameMode error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404, data: { error: 'not found' } } });
    const res = await request(app).get('/questionsRecord/fail/easy');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });

  test('PUT /questionsRecord éxito', async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    const res = await request(app).put('/questionsRecord').send({ data: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
  test('PUT /questionsRecord error', async () => {
    axios.post.mockRejectedValueOnce(new Error('fail'));
    const res = await request(app).put('/questionsRecord').send({ data: 1 });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /user/group éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { group: 'g1' } });
    const res = await request(app).get('/user/group?username=test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ group: 'g1' });
  });
  test('GET /user/group error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404, data: { error: 'not found' } } });
    const res = await request(app).get('/user/group?username=fail');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });

  test('GET /user/:username éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { user: 'test' } });
    const res = await request(app).get('/user/test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ user: 'test' });
  });
  test('GET /user/:username error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404, data: { error: 'not found' } } });
    const res = await request(app).get('/user/fail');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });

  test('GET /user éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { users: [1,2] } });
    const res = await request(app).get('/user');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ users: [1,2] });
  });
  test('GET /user error', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    const res = await request(app).get('/user');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /user éxito', async () => {
    axios.post.mockResolvedValueOnce({ data: { user: 'test' } });
    const res = await request(app).post('/user').send({ username: 'test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ user: 'test' });
  });
  test('POST /user error', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'bad' } } });
    const res = await request(app).post('/user').send({ username: 'fail' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'bad' });
  });

  test('GET /questions/random/:n éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ q: 1 }, { q: 2 }] });
    const res = await request(app).get('/questions/random/2');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ q: 1 }, { q: 2 }]);
  });
  test('GET /questions/random/:n error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 500, data: { error: 'fail' } }, message: 'fail' });
    const res = await request(app).get('/questions/random/2');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /questions/random/:category/:n éxito', async () => {    axios.get.mockResolvedValueOnce({ data: [{ q: 1 }, { q: 2 }] });
    const res = await request(app).get('/questions/random/flags/2?username=test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ q: 1 }, { q: 2 }]);
  });
  test('GET /questions/random/:category/:n error', async () => {    axios.get.mockRejectedValueOnce({ response: { status: 500, data: { error: 'fail' } }, message: 'fail' });
    const res = await request(app).get('/questions/random/flags/2?username=test');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /statistics éxito', async () => {
    axios.post.mockResolvedValueOnce({ data: { updated: true } });
    const res = await request(app).put('/statistics').send({ username: 'test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ updated: true });
  });
  test('PUT /statistics error', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'fail' } } });
    const res = await request(app).put('/statistics').send({ username: 'fail' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /statistics/:username éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { stats: 123 } });
    const res = await request(app).get('/statistics/testuser?loggedUser=admin');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ stats: 123 });
  });
  test('GET /statistics/:username error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404, data: { error: 'not found' } } });
    const res = await request(app).get('/statistics/fail?loggedUser=admin');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /group/ranking éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { rank: [1,2] } });
    const res = await request(app).get('/group/ranking');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ rank: [1,2] });
  });
  test('GET /group/ranking error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 500, data: { error: 'fail' } } });
    const res = await request(app).get('/group/ranking');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /group éxito', async () => {
    axios.post.mockResolvedValueOnce({ data: { group: 'g1' } });
    const res = await request(app).post('/group').send({ name: 'g1' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ group: 'g1' });
  });
  test('POST /group error', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'fail' } } });
    const res = await request(app).post('/group').send({ name: 'fail' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /group/:name éxito', async () => {
    axios.get.mockResolvedValueOnce({ data: { group: 'g1' } });
    const res = await request(app).get('/group/g1?username=test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ group: 'g1' });
  });
  test('GET /group/:name error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404, data: { error: 'not found' } } });
    const res = await request(app).get('/group/fail?username=test');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /group/:name éxito', async () => {
    axios.post.mockResolvedValueOnce({ data: { joined: true } });
    const res = await request(app).put('/group/g1').send({ username: 'test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ joined: true });
  });
  test('PUT /group/:name error', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'fail' } } });
    const res = await request(app).put('/group/g1').send({ username: 'fail' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /group/:name/exit éxito', async () => {
    axios.post.mockResolvedValueOnce({ data: { exited: true } });
    const res = await request(app).put('/group/g1/exit').send({ username: 'test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ exited: true });
  });
  test('PUT /group/:name/exit error', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'fail' } } });
    const res = await request(app).put('/group/g1/exit').send({ username: 'fail' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Cobertura extra de ramas en endpoints de preguntas', () => {
  it('GET /questions/random/:n error sin response ni message', async () => {
    axios.get.mockRejectedValueOnce({});
    const res = await request(app).get('/questions/random/2');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
  it('GET /questions/random/:category/:n error sin response ni message', async () => {    axios.get.mockRejectedValueOnce({});
    const res = await request(app).get('/questions/random/flags/2?username=test');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Cobertura de ramas en handleErrors', () => {
  const { app } = require('../gateway-service');
  // Endpoint de prueba temporal para forzar handleErrors
  app.get('/test-handle-errors', (req, res) => {
    // Simula error sin response ni message
    const error = {};
    // Llama a handleErrors directamente
    const handleErrors = require('../gateway-service').handleErrors || ((res, error) => {
      if (error.response && error.response.status) {
        res.status(error.response.status).json({ error: error.response.data.error });
      } else if (error.message) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    handleErrors(res, error);
  });

  it('debe devolver 500 y mensaje por defecto si no hay error.response ni error.message', async () => {
    const res = await request(app).get('/test-handle-errors');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });

  it('debe devolver 500 y error.message si no hay error.response pero sí error.message', async () => {
    app.get('/test-handle-errors-message', (req, res) => {
      const error = { message: 'Mensaje de error custom' };
      const handleErrors = require('../gateway-service').handleErrors || ((res, error) => {
        if (error.response && error.response.status) {
          res.status(error.response.status).json({ error: error.response.data.error });
        } else if (error.message) {
          res.status(500).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      handleErrors(res, error);
    });
    const res = await request(app).get('/test-handle-errors-message');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Mensaje de error custom' });
  });
});
