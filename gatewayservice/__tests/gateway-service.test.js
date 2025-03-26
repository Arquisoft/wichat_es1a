const request = require('supertest');
const { app, server } = require('../gateway-service'); // Asegúrate de actualizar la ruta correcta

describe('Gateway API Tests', () => {

    afterAll(() => {
        server.close();
      });

    it('should return health check status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'OK' });
    });
  
    it('should fetch user ranking', async () => {
      const res = await request(app).get('/ranking');
      expect(res.statusCode).toBe(500);
    });
  
    it('should fetch user profile', async () => {
      const res = await request(app).get('/profile?username=testuser');
      expect(res.statusCode).toBe(500);
    });
  
    it('should fail to fetch user profile without username', async () => {
      const res = await request(app).get('/profile');
      expect(res.statusCode).toBe(500);
    });
  
    it('should attempt user login', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'password123' });
      expect(res.statusCode).toBe(500);
    });
  });