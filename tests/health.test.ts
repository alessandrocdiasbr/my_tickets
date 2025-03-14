import request from 'supertest';
import app from '../src/app';
import { ERRORS } from '../src/middlewares/error-middleware';

describe('Health Check and Error Handling', () => {
  it('should return 200 when application is healthy', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe("I'm okay!");
  });

  it('should handle internal server error', async () => {
    const mockError = new Error('Internal Server Error');
    const response = await request(app)
      .get('/events/abc')
      .send();

    expect(response.status).toBe(400);
  });

  it('should handle not found error', async () => {
    const response = await request(app)
      .get('/nonexistent-route')
      .send();

    expect(response.status).toBe(404);
  });

  it('should handle custom error types', async () => {
    Object.entries(ERRORS).forEach(([type, statusCode]) => {
      expect(typeof statusCode).toBe('number');
      expect(statusCode).toBeGreaterThanOrEqual(400);
      expect(statusCode).toBeLessThan(600);
    });
  });
});