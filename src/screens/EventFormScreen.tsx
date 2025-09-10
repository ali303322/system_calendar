import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNModalDateTimePicker from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors } from '../constants/Colors';
import { EventService } from '../services/eventService';

// Simple toast for web
function showMessage(message: string, type: 'info' | 'success' | 'error' = 'info') {
  if (Platform.OS === 'web') {
    let toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '40px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = type === 'error' ? '#e74c3c' : '#27ae60';
    toast.style.color = 'white';
    toast.style.padding = '14px 28px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '16px';
    toast.style.zIndex = 9999;
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 2500);
  } else {
    Alert.alert(type === 'error' ? 'Erreur' : 'Succès', message);
  }
}

// Couleurs pour les événements
const eventColors = [
  '#FF6B6B', // Rouge
  '#4ECDC4', // Turquoise
  '#45B7D1', // Bleu
  '#96CEB4', // Vert
  '#FFEAA7', // Jaune
  '#DDA0DD', // Violet
  '#98D8C8', // Vert menthe
  '#F7DC6F', // Jaune doré
  '#BB8FCE', // Lavande
  '#85C1E9', // Bleu ciel
];

interface EventFormScreenProps {
  navigation: any;
  route: any;
}

export const EventFormScreen: React.FC<EventFormScreenProps> = ({
  navigation,
  route,
}) => {
  const event = route.params?.event;
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [startDate, setStartDate] = useState(event?.startDate || new Date());
  const [endDate, setEndDate] = useState(event?.endDate || new Date(Date.now() + 60 * 60 * 1000));
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay || false);
  // Use event color if editing, otherwise default
  const [selectedColor, setSelectedColor] = useState(event?.color || eventColors[0]);
// NOTE: If you see 'props.pointerEvents is deprecated. Use style.pointerEvents',
// search your codebase for pointerEvents used as a prop and replace with style={{ pointerEvents: ... }} for React Native Web compatibility.
  // const [selectedColo, setSelectedColo] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | 'datetime'>('date');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Ajout pour participants
  const [participants, setParticipants] = useState<string[]>(
  event?.participants ? event.participants.map((p: any) => p.user.id) : []
);

const [selectedUsers, setSelectedUsers] = useState<any[]>(
  event?.participants ? event.participants.map((p: any) => ({
    id: p.user.id,
    email: p.user.email,
    fullName: p.user.fullName
  })) : []
);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  // Pour created_by, à adapter selon ton auth
  const [createdBy, setCreatedBy] = useState('');

  

  // Get token from storage
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('authToken');
  } else {
    return AsyncStorage.getItem('authToken');
  }
};

// Decode token to get user ID
const getUserIdFromToken = async () => {
  const token = await getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.sub; // adjust if your JWT uses another field like userId
  } catch (e) {
    console.error('Invalid token', e);
    return null;
  }
};

  useEffect(() => {
    getUserIdFromToken().then((userId) => {
      if (userId) {
        setCreatedBy(userId);
      }
    });
  }, []);

  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({ title: 'Modifier l\'événement' });
    } else {
      navigation.setOptions({ title: 'Nouvel événement' });
    }
  }, [isEditing, navigation]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (startDate >= endDate && !isAllDay) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Recherche asynchrone d'utilisateurs par email
const searchUsers = async (query: string) => {
  if (!query) return setUserResults([]);
  try {
    const res = await axios.get(`http://192.168.11.122:8000/user/search`, { params: { email: query } });
    setUserResults(res.data || []);
  } catch (e) {
    setUserResults([]);
  }
};



  // Ajout/suppression d'un participant
  const toggleParticipant = (user: any) => {
    if (participants.includes(user.id)) {
      setParticipants(participants.filter((id) => id !== user.id));
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setParticipants([...participants, user.id]);
      setSelectedUsers([...selectedUsers, user]); // user is { id, email }
    }
  };
  console.log('par :',participants);
  console.log('users :',selectedUsers);
  console.log('event :',event);

  
  
  

  // Nouvelle logique de sauvegarde avec axios (POST pour ajout, PUT pour update)
  const handleAdd = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        start_datetime: startDate,
        end_datetime: endDate,
        color : selectedColor,
        location: location.trim(),
        is_public: true, // always true for add, or adapt as needed
        created_by: createdBy,
        participants : participants,
      };
      await axios.post('http://192.168.11.122:8000/events', payload);
  showMessage('Événement créé avec succès !', 'success');
  setTimeout(() => navigation.goBack(), Platform.OS === 'web' ? 1200 : 0);
    } catch (error) {
  showMessage("Impossible de créer l'événement"+error, 'error');
      console.error('Erreur lors de la création:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        start_datetime: startDate,
        end_datetime: endDate,
        color : selectedColor,
        location: location.trim(),
        is_public: event.is_public, // keep as is for update
        created_by: createdBy,
        participants : participants,
      };
      await axios.put(`http://192.168.11.122:8000/events/${event.id}`, payload);
  showMessage('Événement modifié avec succès !', 'success');
  setTimeout(() => navigation.goBack(), Platform.OS === 'web' ? 1200 : 0);
    } catch (error) {
  showMessage("Impossible de modifier l'événement"+error, 'error');
      console.error('Erreur lors de la modification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id) return;

    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        try {
          setLoading(true);
          await EventService.deleteEvent(event.id);
          showMessage('Événement supprimé avec succès !', 'success');
          setTimeout(() => navigation.goBack(), 1200);
        } catch (error) {
          showMessage('Impossible de supprimer l\'événement', 'error');
          console.error('Erreur lors de la suppression:', error);
        } finally {
          setLoading(false);
        }
      }
    } else {
      Alert.alert(
        'Supprimer l\'événement',
        'Êtes-vous sûr de vouloir supprimer cet événement ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await EventService.deleteEvent(event.id);
                showMessage('Événement supprimé avec succès !', 'success');
                navigation.goBack();
              } catch (error) {
                showMessage('Impossible de supprimer l\'événement', 'error');
                console.error('Erreur lors de la suppression:', error);
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Ajuster automatiquement la date de fin si elle est avant la nouvelle date de début
      if (endDate <= selectedDate && !isAllDay) {
        const newEndDate = new Date(selectedDate.getTime() + 60 * 60 * 1000);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (date: Date) => {
    return `${formatDate(date)} à ${formatTime(date)}`;
  };

  console.log(selectedColor);
  

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* ...existing form content... */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations générales</Text>
            <Input
              label="Titre *"
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de l'événement"
              error={errors.title}
              leftIcon={<Ionicons name="calendar" size={20} color={colors.textSecondary} />}
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Description de l'événement"
              multiline
              numberOfLines={3}
              leftIcon={<Ionicons name="document-text" size={20} color={colors.textSecondary} />}
            />
            <Input
              label="Lieu"
              value={location}
              onChangeText={setLocation}
              placeholder="Lieu de l'événement"
              leftIcon={<Ionicons name="location" size={20} color={colors.textSecondary} />}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date et heure</Text>
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeLabel}>Début</Text>
              <TouchableOpacity
                style={styles.dateTimeInputTouchable}
                onPress={() => {
                  setPickerMode(isAllDay ? 'date' : 'datetime');
                  setShowStartPicker(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dateTimeInputBox}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{marginRight: 6}} />
                  <Text style={styles.dateTimeInputText}>
                    {isAllDay ? formatDate(startDate) : formatDateTime(startDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeLabel}>Fin</Text>
              <TouchableOpacity
                style={styles.dateTimeInputTouchable}
                onPress={() => {
                  setPickerMode(isAllDay ? 'date' : 'datetime');
                  setShowEndPicker(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dateTimeInputBox}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{marginRight: 6}} />
                  <Text style={styles.dateTimeInputText}>
                    {isAllDay ? formatDate(endDate) : formatDateTime(endDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {errors.endDate && (
              <Text style={styles.errorText}>{errors.endDate}</Text>
            )}
            {/* <TouchableOpacity
              style={styles.allDayToggle}
              onPress={() => setIsAllDay(!isAllDay)}
            >
              <Ionicons
                name={isAllDay ? "checkbox" : "square-outline"}
                size={24}
                color={isAllDay ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.allDayText}>Toute la journée</Text>
            </TouchableOpacity> */}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <Input
              label="Rechercher un utilisateur par email"
              value={userSearch}
              onChangeText={(text) => {
                setUserSearch(text);
                if (text.length >= 2) {
                  searchUsers(text);
                } else {
                  setUserResults([]);
                }
              }}
              placeholder="Entrer l'email..."
              leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
            />
            {userResults.length > 0 && (
              <View style={[styles.participantDropdown, {maxHeight: 180, overflow: 'scroll'}]}>
                {userResults.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => toggleParticipant(user)}
                    style={[styles.participantDropdownItem, participants.includes(user.id) && styles.participantDropdownItemSelected]}
                    activeOpacity={0.7}
                  >

                    <Ionicons
                      name={participants.includes(user.id) ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={participants.includes(user.id) ? colors.primary : colors.textSecondary}
                      style={{marginRight: 8}}
                    />
                    <Text style={{ color: participants.includes(user.id) ? colors.primary : colors.text }}>{user.email}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.selectedParticipantsRow}>
              {selectedUsers.map((user) => (
                <View key={user.id} style={styles.selectedParticipantChip}>
                  <Ionicons name="person" size={14} color={colors.primary} style={{marginRight: 4}} />
                  <Text style={styles.selectedParticipantText}>
                    {user.fullName ?? user.email}
                  </Text>

                </View>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Couleur</Text>
            <View style={[styles.colorPicker, {pointerEvents: "auto"}]}>
              {eventColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* DateTimePicker modals pour mobile */}
          {/* Picker mobile (modal) et web (inline) */}
          {Platform.OS === 'web' ? (
            <>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode={pickerMode}
                  display="inline"
                  onChange={handleStartDateChange}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode={pickerMode}
                  display="inline"
                  onChange={handleEndDateChange}
                />
              )}
            </>
          ) : (
            <>
              <RNModalDateTimePicker
                isVisible={showStartPicker}
                mode={pickerMode}
                date={startDate}
                onConfirm={(date: Date) => {
                  setShowStartPicker(false);
                  handleStartDateChange(null, date);
                }}
                onCancel={() => setShowStartPicker(false)}
                display="default"
              />
              <RNModalDateTimePicker
                isVisible={showEndPicker}
                mode={pickerMode}
                date={endDate}
                onConfirm={(date: Date) => {
                  setShowEndPicker(false);
                  handleEndDateChange(null, date);
                }}
                onCancel={() => setShowEndPicker(false)}
                display="default"
              />
            </>
          )}
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            {isEditing && (
              <Button
                title="Supprimer"
                onPress={handleDelete}
                variant="outline"
                style={styles.deleteButton}
                fullWidth
              />
            )}
            {isEditing ? (
              <Button
                title="Modifier"
                onPress={handleUpdate}
                loading={loading}
                style={styles.saveButton}
                fullWidth
              />
            ) : (
              <Button
                title="Créer"
                onPress={handleAdd}
                loading={loading}
                style={styles.saveButton}
                fullWidth
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  dateTimeContainer: {
    gap: 16,
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    minWidth: 60,
  },
  dateTimeInputTouchable: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginLeft: 8,
    marginVertical: 2,
  },
  dateTimeInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeInputText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  participantDropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 10,
  },
  participantDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantDropdownItemSelected: {
    backgroundColor: '#e6f7ff',
  },
  selectedParticipantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
  },
  selectedParticipantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  selectedParticipantText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  allDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  allDayText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedColor: {
    borderColor: colors.text,
    borderWidth: 3,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
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
  saveButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    borderColor: colors.error,
  },
}); 