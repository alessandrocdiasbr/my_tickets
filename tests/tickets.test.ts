import httpStatus from 'http-status';
import supertest from 'supertest';
import { createEvent, createExpiredEvent } from '../tests/factories/event-factory';
import { buildTicketData, createTicket, createUsedTicket } from '../tests/factories/ticket-factory';
import prisma from '../src/database/index';
import app from '../src/app';

beforeAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "events" RESTART IDENTITY CASCADE;`;
});

afterAll(async () => {
    await prisma.$disconnect();
});

const server = supertest(app);

describe('GET /tickets/:eventId', () => {
  it('should respond with status 400 when eventId is not a valid number', async () => {
    const response = await server.get('/tickets/invalid-id');
    
    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it('should respond with status 200 and an empty array when there are no tickets for the event', async () => {
    const event = await createEvent();
    
    const response = await server.get(`/tickets/${event.id}`);
    
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual([]);
  });

  it('should respond with status 200 and a non-empty array when there are tickets for the event', async () => {
    const event = await createEvent();
    await createTicket(event.id);
    await createTicket(event.id);
    
    const response = await server.get(`/tickets/${event.id}`);
    
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toEqual(expect.objectContaining({
      id: expect.any(Number),
      code: expect.any(String),
      owner: expect.any(String),
      eventId: event.id,
      used: expect.any(Boolean)
    }));
  });
});

describe('POST /tickets', () => {
  it('should respond with status 422 when body is not valid', async () => {
    const invalidBody = { invalidField: 'value' };
    
    const response = await server.post('/tickets').send(invalidBody);
    
    expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });

  it('should respond with status 404 when event does not exist', async () => {
    const ticketData = buildTicketData(999999);
    
    const response = await server.post('/tickets').send(ticketData);
    
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 403 when event has already happened', async () => {
    const expiredEvent = await createExpiredEvent();
    const ticketData = buildTicketData(expiredEvent.id);
    
    const response = await server.post('/tickets').send(ticketData);
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 409 when ticket code already exists for the event', async () => {
    const event = await createEvent();
    const existingTicket = await createTicket(event.id);
    const ticketData = buildTicketData(event.id, {
      code: existingTicket.code
    });
    
    const response = await server.post('/tickets').send(ticketData);
    
    expect(response.status).toBe(httpStatus.CONFLICT);
  });

  it('should respond with status 201 and created ticket when body is valid', async () => {
    const event = await createEvent();
    const ticketData = buildTicketData(event.id);
    
    const response = await server.post('/tickets').send(ticketData);
    
    expect(response.status).toBe(httpStatus.CREATED);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      code: ticketData.code,
      owner: ticketData.owner,
      eventId: event.id,
      used: false
    }));
  });
});

describe('PUT /tickets/use/:id', () => {
  it('should respond with status 404 when ticket does not exist', async () => {
    const response = await server.put('/tickets/use/999999');
    
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 400 when id is not a valid number', async () => {
    const response = await server.put('/tickets/use/invalid-id');
    
    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it('should respond with status 403 when event has already happened', async () => {
    const expiredEvent = await createExpiredEvent();
    const ticket = await createTicket(expiredEvent.id);
    
    const response = await server.put(`/tickets/use/${ticket.id}`);
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 when ticket is already used', async () => {
    const event = await createEvent();
    const ticket = await createUsedTicket(event.id);
    
    const response = await server.put(`/tickets/use/${ticket.id}`);
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 204 when ticket is successfully marked as used', async () => {
    const event = await createEvent();
    const ticket = await createTicket(event.id);
    
    const response = await server.put(`/tickets/use/${ticket.id}`);
    
    expect(response.status).toBe(httpStatus.NO_CONTENT);
  });

  //novos testes
  
});