import { faker } from '@faker-js/faker';
import { Ticket } from '@prisma/client';
import prisma from '../../src/database';
import { CreateTicketData } from '../../src/repositories/tickets-repository';

export function buildTicketData(eventId: number, params: Partial<CreateTicketData> = {}): CreateTicketData {
  return {
    code: params.code || faker.string.alphanumeric(8).toUpperCase(),
    owner: params.owner || faker.person.fullName(),
    eventId: params.eventId || eventId,
  };
}

export async function createTicket(eventId: number, params: Partial<CreateTicketData> = {}): Promise<Ticket> {
  const ticketData = buildTicketData(eventId, params);
  
  return prisma.ticket.create({
    data: ticketData,
  });
}

export async function createUsedTicket(eventId: number, params: Partial<CreateTicketData> = {}): Promise<Ticket> {
  const ticketData = buildTicketData(eventId, params);
  
  return prisma.ticket.create({
    data: {
      ...ticketData,
      used: true
    },
  });
}