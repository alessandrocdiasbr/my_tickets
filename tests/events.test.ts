import request from 'supertest';
import app from '../src/app'; 
import prisma from '../src/database/index';
import { faker } from '@faker-js/faker';

describe('Events', () => {
  let eventId: number;

  beforeAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "events" RESTART IDENTITY CASCADE;`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new event', async () => {
    const eventData = {
      name: faker.lorem.words(),
      date: faker.date.future().toISOString(),
    };

    const response = await request(app)
      .post('/events')
      .send(eventData);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(eventData.name);
    expect(response.body.date).toBe(eventData.date);

    eventId = response.body.id; 
  });

  it('should get all events', async () => {
    const response = await request(app).get('/events');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get a specific event by ID', async () => {
    const response = await request(app).get(`/events/${eventId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(eventId);
  });

  it('should update an event', async () => {
    const updatedEventData = {
      name: faker.lorem.words(),
      date: faker.date.future().toISOString(),
    };

    const response = await request(app)
      .put(`/events/${eventId}`)
      .send(updatedEventData);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedEventData.name);
    expect(response.body.date).toBe(updatedEventData.date);
  });

  it('should delete an event', async () => {
    const response = await request(app).delete(`/events/${eventId}`);

    expect(response.status).toBe(204);

    const deletedEventResponse = await request(app).get(`/events/${eventId}`);
    expect(deletedEventResponse.status).toBe(404);
  });

  //novos testes
  it('should return 409 when trying to create an event with duplicate name', async () => {
    const eventData = {
      name: faker.lorem.words(),
      date: faker.date.future().toISOString(),
    };

    await request(app)
      .post('/events')
      .send(eventData);

    const response = await request(app)
      .post('/events')
      .send(eventData);

    expect(response.status).toBe(409);
  });

  it('should return 404 when trying to update a non-existent event', async () => {
    const updatedEventData = {
      name: faker.lorem.words(),
      date: faker.date.future().toISOString(),
    };

    const response = await request(app)
      .put('/events/999999')
      .send(updatedEventData);

    expect(response.status).toBe(404);
  });

  it('should return 409 when updating an event with existing name', async () => {
    const firstEventData = {
      name: faker.lorem.words(),
      date: faker.date.future().toISOString(),
    };

    const secondEventData = {
      name: faker.lorem.words(),
      date: faker.date.future().toISOString(),
    };

    const firstEvent = await request(app)
      .post('/events')
      .send(firstEventData);

    const secondEvent = await request(app)
      .post('/events')
      .send(secondEventData);

    const response = await request(app)
      .put(`/events/${secondEvent.body.id}`)
      .send({ name: firstEventData.name, date: secondEventData.date });

    expect(response.status).toBe(409);
  });

  it('should return 404 when trying to delete a non-existent event', async () => {
    const response = await request(app).delete('/events/999999');

    expect(response.status).toBe(404);
  });
});