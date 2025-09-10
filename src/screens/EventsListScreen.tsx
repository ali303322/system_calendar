import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../constants/Colors';
import { Event, User } from '../types';

interface EventsListScreenProps {
  user: User | null;
  navigation: any;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  color: string;
  is_public: boolean;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

type TokenPayload = {
  sub: string;   // or "userId" depending on how you generate the JWT
  email: string;
  exp: number;
};



export const EventsListScreen: React.FC<EventsListScreenProps> = ({ user, navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullEventsCount, setFullEventsCount] = useState(0);
  const [currentMonthCount, setCurrentMonthCount] = useState(0);
  const [currentDayCount, setCurrentDayCount] = useState(0);

  

// // getEvents();

// useEffect(() => {
//   getEvents();
// }, []);

  useEffect(() => {
    loadUserEvents();
  }, []);

  // Recharger les événements quand on revient sur l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setLoading(true);
      const token = await getToken();
      if (token) {
        try {
          const decoded: TokenPayload = jwtDecode(token);
          const userId = decoded.sub;
          if (userId) {
            await loadUserEvents(userId, token);
          }
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [navigation]);

const loadUserEvents = async (userId: string, token: string) => {
  try {
    const response = await axios.get(
      `http://192.168.11.122:8000/events/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("User Events:", response.data.events);

    setEvents(response.data.events);
    setFullEventsCount(response.data.counts.total);
    setCurrentMonthCount(response.data.counts.thisMonth);
    setCurrentDayCount(response.data.counts.today);

  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error("Unauthorized – maybe token expired?");
    } else {
      console.error("Error fetching user events:", error);
    }
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  const load = async () => {
    const token = await getToken(); // getToken should check AsyncStorage/localStorage
    console.log("Loaded token:", token);
    
    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);
        const userId = decoded.sub; // or decoded.userId depending on your JWT
        console.log("user id:", userId);
        

        if (userId) {
          await loadUserEvents(userId, token); // pass token too
        }
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  };

  load();
}, []);




  

  const handleCreateEvent = () => {
    navigation.navigate('EventForm', { mode: 'create' });
  };

  const   handleEditEvent = (event: Event) => {
    navigation.navigate('EventForm', { mode: 'edit', event });
  };

  const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("authToken");
  } else {
    return await AsyncStorage.getItem("authToken");
  }
};

const confirmDelete = async (message: string) => {
  if (Platform.OS === "web") {
    return window.confirm(message);
  } else {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        "Confirmation",
        message,
        [
          { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
          { text: "Supprimer", style: "destructive", onPress: () => resolve(true) },
        ]
      );
    });
  }
};


const handleDeleteEvent = async (event: Event) => {
  const confirmed = await confirmDelete(`Supprimer "${event.title}" ?`);
  if (!confirmed) return;

  try {
    const token = await getToken();

    await axios.delete(`http://192.168.11.122:8000/events/${event.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (Platform.OS === "web") {
      alert("Événement supprimé avec succès");
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } else {
      Alert.alert("Succès", "Événement supprimé avec succès");
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }

  } catch (error: any) {
    console.error("Delete event error:", error.response?.data || error.message);
    if (Platform.OS === "web") {
      alert("Erreur lors de la suppression");
    } else {
      Alert.alert("Erreur", "Impossible de supprimer l'événement");
    }
  }
};



  const handleViewEvent = (eventId : string) => {
  navigation.navigate('EventDetails', { eventId: eventId });
  };

  const getEventIcon = (event: Event) => {
    // if (event.isAllDay) return 'calendar';
    if (event.location) return 'location';
    return 'calendar';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventsForToday = () => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === today.toDateString();
    });
  };

  const getEventsForThisMonth = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime
);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
  };
  
  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liste des événements</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
          <Ionicons name="add" size={24} color={colors.card} />
        </TouchableOpacity>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{fullEventsCount}</Text>
          <Text style={styles.statLabel}>Événements</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentMonthCount}</Text>
          <Text style={styles.statLabel}>Ce mois</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentDayCount}</Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
      </View>

      {/* Liste des événements */}
      <ScrollView style={styles.eventsList}>
        {loading && !events ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des événements...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucun événement</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore créé d'événements. Commencez par en créer un !
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreateEvent}>
              <Text style={styles.emptyButtonText}>Créer un événement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          events.map((ev) => (
            <TouchableOpacity 
              key={ev.id} 
              style={styles.eventCard}
              onPress={() => handleViewEvent(ev.id)}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventTypeContainer}>
                  <View style={[styles.eventTypeDot, { backgroundColor: ev.color }]} />
                  <Text style={styles.eventType}>
                    Événement
                  </Text>
                </View>
                <View style={styles.eventActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditEvent(ev)}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteEvent(ev)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.eventTitle}>{ev.title}</Text>
              
              {ev.description && (
                <Text style={styles.eventDescription}>{ev.description}</Text>
              )}
              
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.eventDetailText}>
                    {formatDate(new Date(ev.start_datetime))}
                  </Text>
                </View>
                {/* {!ev.isAllDay && (
                  <View style={styles.eventDetail}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.eventDetailText}>
                      {formatTime(new Date(ev.start_datetime))} - {formatTime(new Date(ev.end_datetime))}
                    </Text>
                  </View>
                )} */}
                {ev.location && (
                  <View style={styles.eventDetail}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.eventDetailText}>{ev.location}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bouton flottant pour créer un événement */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateEvent}>
        <Ionicons name="add" size={30} color={colors.card} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: colors.card,
    margin: 20,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  eventDetails: {
    gap: 10,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
}); 