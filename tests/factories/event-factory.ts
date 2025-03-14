import { faker } from '@faker-js/faker';
import { Event } from '@prisma/client';
import prisma from '../../src/database';
import { CreateEventData } from '../../src/repositories/events-repository';

export function buildEventData(params: Partial<CreateEventData> = {}): CreateEventData {
  return {
    name: params.name || faker.word.words(3),
    date: params.date || faker.date.future({ years: 1 }),
  };
}


export async function createEvent(params: Partial<CreateEventData> = {}): Promise<Event> {
  const eventData = buildEventData(params);
  
  return prisma.event.create({
    data: eventData,
  });
}


export async function createExpiredEvent(params: Partial<CreateEventData> = {}): Promise<Event> {
  const eventData = buildEventData({
    ...params,
    date: faker.date.past({ years: 1 })
  });
  
  return prisma.event.create({
    data: eventData,
  });
}
