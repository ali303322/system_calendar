import { Event } from '../types';

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: number; // en minutes avant l'événement
  sound: boolean;
  vibration: boolean;
}

export interface Notification {
  id: string;
  eventId: string;
  title: string;
  body: string;
  scheduledTime: Date;
  isRead: boolean;
  createdAt: Date;
}

export class NotificationService {
  private static notifications: Notification[] = [];
  private static settings: NotificationSettings = {
    enabled: true,
    reminderTime: 15, // 15 minutes par défaut
    sound: true,
    vibration: true,
  };

  // Planifier une notification pour un événement
  static async scheduleEventNotification(event: Event): Promise<void> {
    if (!this.settings.enabled) return;

    const reminderTime = new Date(event.startDate.getTime() - this.settings.reminderTime * 60 * 1000);
    
    // Ne planifier que si l'événement est dans le futur
    if (reminderTime > new Date()) {
      const notification: Notification = {
        id: `event_${event.id}_${Date.now()}`,
        eventId: event.id,
        title: `Rappel: ${event.title}`,
        body: `${event.title} commence dans ${this.settings.reminderTime} minutes${event.location ? ` à ${event.location}` : ''}`,
        scheduledTime: reminderTime,
        isRead: false,
        createdAt: new Date(),
      };

      this.notifications.push(notification);
      
      // En production, vous utiliseriez expo-notifications ou react-native-push-notification
      console.log(`Notification planifiée pour ${event.title} à ${reminderTime.toLocaleString()}`);
    }
  }

  // Supprimer les notifications d'un événement
  static async cancelEventNotifications(eventId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.eventId !== eventId);
  }

  // Obtenir toutes les notifications
  static async getNotifications(): Promise<Notification[]> {
    return [...this.notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Marquer une notification comme lue
  static async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Marquer toutes les notifications comme lues
  static async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.isRead = true);
  }

  // Supprimer une notification
  static async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  // Supprimer toutes les notifications
  static async clearAllNotifications(): Promise<void> {
    this.notifications = [];
  }

  // Obtenir les paramètres de notification
  static getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Mettre à jour les paramètres de notification
  static updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  // Vérifier les notifications à afficher maintenant
  static checkScheduledNotifications(): Notification[] {
    const now = new Date();
    const dueNotifications = this.notifications.filter(n => 
      !n.isRead && n.scheduledTime <= now
    );
    
    return dueNotifications;
  }

  // Simuler l'envoi d'une notification (pour le web)
  static async sendNotification(notification: Notification): Promise<void> {
    // En production, utilisez expo-notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icon.png', // Ajoutez votre icône
          badge: '/badge.png',
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/icon.png',
            badge: '/badge.png',
          });
        }
      }
    }
    
    // Marquer comme lue après envoi
    await this.markAsRead(notification.id);
  }

  // Initialiser le service de notifications
  static async initialize(): Promise<void> {
    // Demander les permissions sur mobile
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
    
    // Démarrer la vérification périodique des notifications
    setInterval(() => {
      const dueNotifications = this.checkScheduledNotifications();
      dueNotifications.forEach(notification => {
        this.sendNotification(notification);
      });
    }, 60000); // Vérifier toutes les minutes
  }

  // Créer une notification immédiate (pour les tests)
  static async createImmediateNotification(event: Event): Promise<void> {
    const notification: Notification = {
      id: `immediate_${event.id}_${Date.now()}`,
      eventId: event.id,
      title: `Nouvel événement: ${event.title}`,
      body: `L'événement "${event.title}" a été créé${event.location ? ` à ${event.location}` : ''}`,
      scheduledTime: new Date(),
      isRead: false,
      createdAt: new Date(),
    };

    this.notifications.push(notification);
    await this.sendNotification(notification);
  }
} 