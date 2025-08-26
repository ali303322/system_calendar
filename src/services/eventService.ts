import { Event } from '../types';

// Simulation d'une base de données d'événements
let mockEvents: Event[] = [
  // Événement de test pour aujourd'hui
  {
    id: '1',
    title: 'Réunion équipe',
    description: 'Réunion hebdomadaire avec l\'équipe de développement',
    startDate: new Date(new Date().setHours(10, 0, 0, 0)), // Aujourd'hui à 10h
    endDate: new Date(new Date().setHours(11, 0, 0, 0)), // Aujourd'hui à 11h
    location: 'Salle de conférence A',
    color: '#3b82f6',
    isAllDay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Déjeuner avec client',
    description: 'Présentation du projet au client',
    startDate: new Date(new Date().setHours(12, 30, 0, 0)), // Aujourd'hui à 12h30
    endDate: new Date(new Date().setHours(14, 0, 0, 0)), // Aujourd'hui à 14h
    location: 'Restaurant Le Gourmet',
    color: '#10b981',
    isAllDay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Appel téléphonique',
    description: 'Appel avec le fournisseur',
    startDate: new Date(new Date().setHours(15, 0, 0, 0)), // Aujourd'hui à 15h
    endDate: new Date(new Date().setHours(15, 30, 0, 0)), // Aujourd'hui à 15h30
    location: 'Bureau',
    color: '#f59e0b',
    isAllDay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class EventService {
  static async getEvents(): Promise<Event[]> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockEvents];
  }

  static async createEvent(eventData: Partial<Event>): Promise<Event> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventData.title || '',
      description: eventData.description || '',
      startDate: eventData.startDate || new Date(),
      endDate: eventData.endDate || new Date(),
      location: eventData.location || '',
      color: eventData.color || '#6366f1',
      isAllDay: eventData.isAllDay || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockEvents.push(newEvent);
    return newEvent;
  }

  static async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    const eventIndex = mockEvents.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Événement non trouvé');
    }

    const updatedEvent: Event = {
      ...mockEvents[eventIndex],
      ...eventData,
      updatedAt: new Date(),
    };

    mockEvents[eventIndex] = updatedEvent;
    return updatedEvent;
  }

  static async deleteEvent(eventId: string): Promise<void> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    const eventIndex = mockEvents.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Événement non trouvé');
    }

    mockEvents.splice(eventIndex, 1);
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));

    const event = mockEvents.find(e => e.id === eventId);
    return event || null;
  }

  static async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 400));

    return mockEvents.filter(event => {
      return event.startDate >= startDate && event.endDate <= endDate;
    });
  }

  static async getEventsByDate(date: Date): Promise<Event[]> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return mockEvents.filter(event => {
      return event.startDate >= startOfDay && event.startDate <= endOfDay;
    });
  }

  // Méthode utilitaire pour réinitialiser les données de test
  static resetMockData(): void {
    mockEvents = [
      // Événement de test pour aujourd'hui
      {
        id: '1',
        title: 'Réunion équipe',
        description: 'Réunion hebdomadaire avec l\'équipe de développement',
        startDate: new Date(new Date().setHours(10, 0, 0, 0)), // Aujourd'hui à 10h
        endDate: new Date(new Date().setHours(11, 0, 0, 0)), // Aujourd'hui à 11h
        location: 'Salle de conférence A',
        color: '#3b82f6',
        isAllDay: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Déjeuner avec client',
        description: 'Présentation du projet au client',
        startDate: new Date(new Date().setHours(12, 30, 0, 0)), // Aujourd'hui à 12h30
        endDate: new Date(new Date().setHours(14, 0, 0, 0)), // Aujourd'hui à 14h
        location: 'Restaurant Le Gourmet',
        color: '#10b981',
        isAllDay: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: 'Appel téléphonique',
        description: 'Appel avec le fournisseur',
        startDate: new Date(new Date().setHours(15, 0, 0, 0)), // Aujourd'hui à 15h
        endDate: new Date(new Date().setHours(15, 30, 0, 0)), // Aujourd'hui à 15h30
        location: 'Bureau',
        color: '#f59e0b',
        isAllDay: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
} 