import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { colors } from '../constants/Colors';
import { EventService } from '../services/eventService';
import { Event } from '../types';

interface EventDetailsScreenProps {
  navigation: any;
  route: any;
}

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const eventId = route.params?.eventId;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await require('axios').get(`http://192.168.11.122:8000/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'événement:', error);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Événement introuvable</Text>
          <Text style={styles.errorText}>
            L'événement que vous recherchez n'existe pas ou a été supprimé.
          </Text>
          <Button
            title="Retour"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButtonStyle}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    navigation.navigate('EventForm', { event });
  };

  const handleDelete = async () => {
    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await EventService.deleteEvent(event.id);
              Alert.alert('Succès', 'Événement supprimé avec succès !');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
              console.error('Erreur lors de la suppression:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const eventDetails = `${event.title}\n\n`;
      const dateTime = event.isAllDay
        ? `Date: ${formatDate(event.startDate)}`
        : `Début: ${formatDateTime(event.startDate)}\nFin: ${formatDateTime(event.endDate)}`;
      
      const location = event.location ? `\nLieu: ${event.location}` : '';
      const description = event.description ? `\n\n${event.description}` : '';
      
      const shareMessage = eventDetails + dateTime + location + description;
      
      await Share.share({
        message: shareMessage,
        title: event.title,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager l\'événement');
    }
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Ajouter au calendrier',
      'Cette fonctionnalité sera bientôt disponible !',
      [{ text: 'OK' }]
    );
  };

  const handleSetReminder = () => {
    Alert.alert(
      'Définir un rappel',
      'Cette fonctionnalité sera bientôt disponible !',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (date: Date) => {
    return `${formatDate(date)} à ${formatTime(date)}`;
  };

  const getDuration = () => {
  const start = event.start_datetime ? new Date(event.start_datetime) : event.startDate ? new Date(event.startDate) : null;
  const end = event.end_datetime ? new Date(event.end_datetime) : event.endDate ? new Date(event.endDate) : null;

  if (!start || !end) return '';
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes > 0 ? `${diffMinutes}min` : ''}`;
  } else {
    return `${diffMinutes}min`;
  }
};


const getTimeUntilEvent = () => {
  const now = new Date();
  const start = event.start_datetime ? new Date(event.start_datetime) : event.startDate ? new Date(event.startDate) : null;
  const end = event.end_datetime ? new Date(event.end_datetime) : event.endDate ? new Date(event.endDate) : null;

  if (!start || !end) return '';
  if (now > end) {
    return 'Événement terminé';
  } else if (now >= start && now <= end) {
    return 'Événement en cours';
  } else {
    // Event hasn't started yet
    const diffMs = start.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Dans ${diffHours}h ${diffMinutes > 0 ? `${diffMinutes}min` : ''}`;
    } else {
      return `Dans ${diffMinutes}min`;
    }
  }
};
  


  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'événement</Text>
                  <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre et couleur */}
        <View style={styles.titleSection}>
          <View style={[styles.colorIndicator, { backgroundColor: event.color }]} />
          <Text style={styles.title}>{event.title}</Text>
        </View>

        {/* Informations temporelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Date et heure</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Début:</Text>
            <Text style={styles.infoValue}>
              {event.start_datetime ? formatDateTime(new Date(event.start_datetime)) : event.startDate ? formatDateTime(new Date(event.startDate)) : ''}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fin:</Text>
            <Text style={styles.infoValue}>
              {event.end_datetime ? formatDateTime(new Date(event.end_datetime)) : event.endDate ? formatDateTime(new Date(event.endDate)) : ''}
            </Text>
          </View>
          
          {!event.isAllDay && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durée:</Text>
              <Text style={styles.infoValue}>{getDuration()}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut:</Text>
            <Text style={styles.infoValue}>{getTimeUntilEvent()}</Text>
          </View>
        </View>

        {/* Lieu */}
        {event.location && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Lieu</Text>
            </View>
            <Text style={styles.locationText}>{event.location}</Text>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

        {/* Actions rapides */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Actions rapides</Text>
          </View>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleAddToCalendar}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Ajouter au calendrier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleSetReminder}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Définir un rappel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Boutons d'action */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <Button
            title="Modifier"
            onPress={handleEdit}
            variant="outline"
            style={styles.editButton}
            fullWidth
          />
          
          <Button
            title="Supprimer"
            onPress={handleDelete}
            loading={loading}
            variant="outline"
            style={styles.deleteButton}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerActionButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colorIndicator: {
    width: 10,
    height: 30,
    borderRadius: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  actionCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    gap: 12,
  },
  editButton: {
    borderColor: colors.primary,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backButtonStyle: {
    borderColor: colors.primary,
  },
}); 