import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../constants/Colors';
import { Event, User } from '../types';

const { width, height } = Dimensions.get('window');

// Responsive utilities
const isTablet = width >= 768;
const isSmallDevice = width < 375;
const isLargeDevice = width >= 414;

// Responsive dimensions
const getResponsiveSize = (size: number) => {
  if (isSmallDevice) return size * 0.8;
  if (isLargeDevice) return size * 1.1;
  return size;
};

const getResponsivePadding = () => {
  if (isTablet) return 20;
  if (isSmallDevice) return 10;
  return 15;
};

const getSidebarWidth = () => {
  if (isTablet) return width * 0.2;
  if (width < 600) return 0; // Hide sidebar on small screens
  return width * 0.25;
};

const getCalendarDaySize = () => {
  if (isTablet) return 60;
  if (isSmallDevice) return 40;
  return 50;
};

interface CalendarScreenProps {
  user: User | null;
  onLogout: () => void;
  navigation: any;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ user, onLogout, navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('info');

  // Jours de la semaine
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Mois en français
  const monthsInFrench = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];


  useEffect(() => {
    generateCalendar();
    loadEvents();
  }, [currentMonthIndex, currentYear]);

  // Recharger les événements quand on revient sur l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvents();
    });
    return unsubscribe;
  }, [navigation]);

  // Fetch events from /event endpoint
  const loadEvents = async () => {
    try {
      const response = await axios.get('http://192.168.1.35:8000/events');
      // If your backend returns { events: [...] } adjust as needed
      setEvents(response.data.events);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

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

// Fetch user info from backend
const fetchUserInfo = async () => {
  const token = await getToken();
  const userId = await getUserIdFromToken();

  
  if (!token || !userId) {
    console.log('Token or userId not found');
    return null;
  }

  try {
    const response = await axios.get(`http://192.168.1.35:8000/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUserInfo(response.data);   
  } catch (error) {
    console.error('Erreur lors du chargement de l’utilisateur:', error);
    return null;
  }
};
  useEffect(() => {
    fetchUserInfo();
  }, []);


  const generateCalendar = () => {
    setCurrentMonth(monthsInFrench[currentMonthIndex]);
    setCurrentYear(currentYear);

    // Générer les jours du mois actuel
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();
    
    // Ajuster pour commencer par lundi (1) au lieu de dimanche (0)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;
    
    const days = [];
    
    // Ajouter les jours vides au début
    for (let i = 1; i < adjustedFirstDay; i++) {
      days.push({ day: '', isEmpty: true });
    }
    
    // Ajouter les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isEmpty: false });
    }
    
    setCalendarDays(days);
    
    // Mettre à jour la date sélectionnée pour aujourd'hui si on est dans le mois actuel
    const today = new Date();
    if (currentMonthIndex === today.getMonth() && currentYear === today.getFullYear()) {
      setSelectedDate(today.getDate());
    }
  };

  const showToastNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Masquer automatiquement après 3 secondes
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleNewEvent = () => {
    // Créer une notification de rappel
    const newEventNotification = {
      id: 'new_event_' + Date.now(),
      type: 'info',
      title: 'Nouvel événement',
      message: 'Vous allez créer un nouvel événement',
      timestamp: new Date()
    };
    
    // Afficher une notification toast
    showToastNotification('Création d\'un nouvel événement...', 'info');
    
    navigation.navigate('EventForm', { mode: 'create' });
  };

  const handleCalendar = () => {
    Alert.alert('Calendrier', 'Vous êtes déjà dans la vue calendrier');
  };

  const handleTasks = () => {
    navigation.navigate('EventsList');
  };

  const handleShareEvents = () => {
    setShowShareMenu(true);
  };

  const handleShareViaNative = async () => {
    try {
      const shareContent = {
        title: 'Mon calendrier Syncalendar',
        message: `Découvrez mon calendrier organisé avec Syncalendar ! 📅\n\nApplication de gestion d'événements moderne et intuitive.\n\nTéléchargez Syncalendar maintenant !`,
        url: 'https://syncalendar.app', // URL de votre app
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        showToastNotification('Partage réussi !', 'success');
      }
    } catch (error) {
      showToastNotification('Erreur lors du partage', 'warning');
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleShareViaWhatsApp = async () => {
    try {
      const message = encodeURIComponent(
        `Découvrez mon calendrier organisé avec Syncalendar ! 📅\n\nApplication de gestion d'événements moderne et intuitive.\n\nTéléchargez Syncalendar maintenant !`
      );
      const url = `whatsapp://send?text=${message}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        showToastNotification('Ouverture de WhatsApp...', 'success');
      } else {
        Alert.alert('WhatsApp non installé', 'WhatsApp n\'est pas installé sur votre appareil.');
      }
    } catch (error) {
      showToastNotification('Erreur lors de l\'ouverture de WhatsApp', 'warning');
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleShareViaTelegram = async () => {
    try {
      const message = encodeURIComponent(
        `Découvrez mon calendrier organisé avec Syncalendar ! 📅\n\nApplication de gestion d'événements moderne et intuitive.\n\nTéléchargez Syncalendar maintenant !`
      );
      const url = `https://t.me/share/url?url=https://syncalendar.app&text=${message}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        showToastNotification('Ouverture de Telegram...', 'success');
      } else {
        Alert.alert('Telegram non installé', 'Telegram n\'est pas installé sur votre appareil.');
      }
    } catch (error) {
      showToastNotification('Erreur lors de l\'ouverture de Telegram', 'warning');
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleShareViaEmail = async () => {
    try {
      const subject = encodeURIComponent('Découvrez Syncalendar - Mon calendrier organisé');
      const body = encodeURIComponent(
        `Bonjour,\n\nJe vous partage mon calendrier organisé avec Syncalendar ! 📅\n\nSyncalendar est une application de gestion d'événements moderne et intuitive qui m'aide à organiser mon temps efficacement.\n\nFonctionnalités principales :\n• Gestion d'événements intuitive\n• Notifications personnalisables\n• Interface moderne et responsive\n• Synchronisation multi-appareils\n• Mode sombre\n\nTéléchargez Syncalendar maintenant : https://syncalendar.app\n\nCordialement`
      );
      const url = `mailto:?subject=${subject}&body=${body}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        showToastNotification('Ouverture de l\'application email...', 'success');
      } else {
        Alert.alert('Application email non trouvée', 'Aucune application email n\'est configurée sur votre appareil.');
      }
    } catch (error) {
      showToastNotification('Erreur lors de l\'ouverture de l\'email', 'warning');
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleShareViaSMS = async () => {
    try {
      const message = encodeURIComponent(
        `Découvrez mon calendrier organisé avec Syncalendar ! 📅 Application de gestion d'événements moderne. Téléchargez : https://syncalendar.app`
      );
      const url = `sms:?body=${message}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        showToastNotification('Ouverture de l\'application SMS...', 'success');
      } else {
        Alert.alert('Application SMS non trouvée', 'Aucune application SMS n\'est configurée sur votre appareil.');
      }
    } catch (error) {
      showToastNotification('Erreur lors de l\'ouverture du SMS', 'warning');
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleShareViaFacebook = async () => {
    try {
      const message = encodeURIComponent(
        `Découvrez mon calendrier organisé avec Syncalendar ! 📅 Application de gestion d'événements moderne et intuitive.`
      );
      const url = `https://www.facebook.com/sharer/sharer.php?u=https://syncalendar.app&quote=${message}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        showToastNotification('Ouverture de Facebook...', 'success');
      } else {
        Alert.alert('Facebook non installé', 'Facebook n\'est pas installé sur votre appareil.');
      }
    } catch (error) {
      showToastNotification('Erreur lors de l\'ouverture de Facebook', 'warning');
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleShareViaTwitter = async () => {
    try {
      const message = encodeURIComponent(
        `Découvrez mon calendrier organisé avec Syncalendar ! 📅 Application de gestion d'événements moderne.`
      );
      const url = `https://twitter.com/intent/tweet?text=${message}&url=https://syncalendar.app`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        showToastNotification('Ouverture de Twitter...', 'success');
      } else {
        Alert.alert('Twitter non installé', 'Twitter n\'est pas installé sur votre appareil.');
      }
    } catch (error) {
      showToastNotification('Erreur lors de l\'ouverture de Twitter', 'warning');
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleShareViaLinkedIn = async () => {
    try {
      const message = encodeURIComponent(
        `Découvrez mon calendrier organisé avec Syncalendar ! 📅 Application de gestion d'événements moderne et intuitive.`
      );
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=https://syncalendar.app&title=Syncalendar&summary=${message}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        showToastNotification('Ouverture de LinkedIn...', 'success');
      } else {
        Alert.alert('LinkedIn non installé', 'LinkedIn n\'est pas installé sur votre appareil.');
      }
    } catch (error) {
      showToastNotification('Erreur lors de l\'ouverture de LinkedIn', 'warning');
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };


const handleLogout = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } else {
      await AsyncStorage.multiRemove(["authToken", "user"]);
    }


    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

  const handleSettings = () => {
    setShowUserMenu(false);
    navigation.navigate('Profile');
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    navigation.navigate('Profile');
  };

  const handleDateSelect = (day: number) => {
    if (day > 0) {
      setSelectedDate(day);
      Alert.alert('Date sélectionnée', `Vous avez sélectionné le ${day} ${currentMonth} ${currentYear}`);
    }
  };

  const goToPreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
    
    // Réinitialiser la date sélectionnée
    setSelectedDate(1);
  };

  const goToNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
    
    // Réinitialiser la date sélectionnée
    setSelectedDate(1);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonthIndex(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today.getDate());
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonthIndex(monthIndex);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setShowYearPicker(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // Use start_datetime and fallback to a default color if missing
  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonthIndex && 
             eventDate.getFullYear() === currentYear;
    });
  };

  const getNotificationsForToday = () => {
    const today = new Date();
    const todayEvents = getEventsForDay(today.getDate());
    
    const notifications = [];
    
    // Notifications pour les événements d'aujourd'hui
    todayEvents.forEach(event => {
      const eventTime = new Date(event.startDate);
      const timeDiff = eventTime.getTime() - today.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));
      
      if (minutesDiff > 0 && minutesDiff <= 60) {
        notifications.push({
          icon: 'time' as any,
          color: colors.eventYellow,
          type: 'Rappel',
          text: `${event.title} dans ${minutesDiff} min`,
          time: eventTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
      } else if (minutesDiff <= 0 && minutesDiff > -120) {
        notifications.push({
          icon: 'play-circle' as any,
          color: colors.eventBlue,
          type: 'En cours',
          text: `${event.title} est en cours`,
          time: eventTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
    
    // Notifications pour les événements de demain
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEvents = getEventsForDay(tomorrow.getDate());
    
    if (tomorrowEvents.length > 0) {
      notifications.push({
        icon: 'calendar' as any,
        color: colors.eventCyan,
        type: 'Demain',
        text: `${tomorrowEvents.length} événement(s) prévu(s)`,
        time: 'Préparation'
      });
    }
    
    // Notifications générales
    if (notifications.length === 0) {
      notifications.push({
        icon: 'checkmark-circle' as any,
        color: colors.success,
        type: 'Aucun événement',
        text: 'Aucun événement prévu aujourd\'hui',
        time: 'Journée libre'
      });
    }
    
    return notifications;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Mobile Header for small screens */}
      {!isTablet && (
        <View style={styles.mobileHeader}>
          <View style={styles.mobileHeaderContent}>
            <View style={styles.mobileHeaderLeft}>
              <View style={styles.calendarIcon}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
              <Text style={styles.mobileHeaderTitle}>Calendrier</Text>
            </View>
            <TouchableOpacity style={styles.profileIconMobile} onPress={handleUserMenu}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        {/* Barre latérale gauche - Hidden on mobile */}
        {isTablet && (
          <View style={styles.leftSidebar}>
            <View style={styles.sidebarHeader}>
              <View style={styles.calendarIcon}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={styles.sidebarTitle}>Calendrier</Text>
            </View>

            <TouchableOpacity style={styles.newEventButton} onPress={handleNewEvent}>
              <Text style={styles.newEventText}>Nouvel événement</Text>
            </TouchableOpacity>

            <View style={styles.navigationMenu}>
              <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={handleCalendar}>
                <View style={[styles.navIcon, styles.navIconActive]}>
                  <Ionicons name="calendar" size={20} color={colors.card} />
                </View>
                <Text style={[styles.navText, styles.navTextActive]}>Calendrier</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem} onPress={handleTasks}>
                <View style={styles.navIcon}>
                  <Ionicons name="list" size={20} color={colors.primary} />
                </View>
                <Text style={styles.navText}>Liste des événements</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem} onPress={handleShareEvents}>
                <View style={styles.navIcon}>
                  <Ionicons name="share-social" size={20} color={colors.primary} />
                </View>
                <Text style={styles.navText}>Partager les RDV</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Zone centrale - Calendrier */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <View style={styles.calendarNavigation}>
              <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
                <Ionicons name="chevron-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              
              <View style={styles.monthYearContainer}>
                <TouchableOpacity 
                  style={styles.monthYearSelector} 
                  onPress={() => setShowMonthPicker(true)}
                >
                  <Text style={styles.monthTitle}>{currentMonth}</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.monthYearSelector} 
                  onPress={() => setShowYearPicker(true)}
                >
                  <Text style={styles.yearTitle}>{currentYear}</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {userInfo && (
              <Text style={styles.welcomeText}>Bonjour, {(userInfo as any).fullName || 'Utilisateur'} !</Text>
            )}
          </View>

          {/* Mobile Navigation for small screens */}
          {!isTablet && (
            <View style={styles.mobileNavigation}>
              <TouchableOpacity style={[styles.mobileNavButton, styles.mobileNavButtonPrimary]} onPress={handleNewEvent}>
                <Ionicons name="add" size={18} color={colors.card} />
                <Text style={[styles.mobileNavText, styles.mobileNavTextPrimary]}>Nouvel événement</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mobileNavButton} onPress={handleTasks}>
                <Ionicons name="list" size={18} color={colors.primary} />
                <Text style={styles.mobileNavText}>Liste</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mobileNavButton} onPress={handleShareEvents}>
                <Ionicons name="share-social" size={18} color={colors.primary} />
                <Text style={styles.mobileNavText}>Partager</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.calendarScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.calendarGrid}>
              {/* En-têtes des jours */}
              {weekDays.map((day, index) => (
                <View key={`header-${index}`} style={styles.calendarDay}>
                  <Text style={styles.weekDayHeader}>{day}</Text>
                </View>
              ))}
              
              {/* Jours du mois */}
              {calendarDays.map((item, index) => {
                if (item.isEmpty) {
                  return <View key={`empty-${index}`} style={styles.calendarDay} />;
                }
                
                const dayEvents = getEventsForDay(item.day);
                console.log('Events for day', item);
                
                const today = new Date();
                const isToday = item.day === today.getDate() && 
                               currentMonthIndex === today.getMonth() && 
                               currentYear === today.getFullYear();
                const isSelected = item.day === selectedDate;
                
                return (
                  <TouchableOpacity 
                    key={item.day} 
                    style={[
                      styles.calendarDay,
                      isToday && styles.todayDay,
                      isSelected && styles.selectedDayContainer
                    ]}
                    onPress={() => handleDateSelect(item.day)}
                  >
                    <Text style={[
                      styles.dayNumber,
                      isToday && styles.todayDayNumber,
                      isSelected && styles.selectedDayNumber
                    ]}>
                      {item.day}
                    </Text>
                    
                    {dayEvents.length > 0 && (
  <View style={styles.eventDotsContainer}>
    {dayEvents.slice(0, 3).map((event, eventIndex) => (
      <View
        key={event.id || eventIndex}
        style={[
          styles.eventDot,
          { backgroundColor: event.color || '#4ECDC4' },
          eventIndex > 0 && styles.eventDotMargin,
        ]}
      />
    ))}
    {dayEvents.length > 3 && (
      <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
    )}
  </View>
)}

                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Panneau latéral droit - Notifications */}
        {isTablet && (
          <View style={styles.rightSidebar}>
            <Text style={styles.notificationsTitle}>Notifications</Text>
            
            <ScrollView style={styles.notificationsScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.notificationsList}>
                {getNotificationsForToday().map((notification, index) => (
                  <View key={index} style={styles.notificationCard}>
                    <View style={styles.notificationIcon}>
                      <Ionicons name={notification.icon} size={20} color={notification.color} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationType}>{notification.type}</Text>
                      <Text style={styles.notificationText}>{notification.text}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                  </View>
                ))}
                
                {getNotificationsForToday().length === 0 && (
                  <View style={styles.noNotifications}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.textSecondary} />
                    <Text style={styles.noNotificationsText}>Aucune notification</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Mobile Notifications Panel */}
      {!isTablet && (
        <View style={styles.mobileNotificationsPanel}>
          <View style={styles.mobileNotificationsHeader}>
            <Text style={styles.mobileNotificationsTitle}>Notifications</Text>
            <TouchableOpacity style={styles.mobileNotificationsButton}>
              <Ionicons name="notifications" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileNotificationsScroll}>
            {getNotificationsForToday().map((notification, index) => (
              <View key={index} style={styles.mobileNotificationCard}>
                <View style={[styles.mobileNotificationIcon, { backgroundColor: notification.color + '20' }]}>
                  <Ionicons name={notification.icon} size={16} color={notification.color} />
                </View>
                <View style={styles.mobileNotificationContent}>
                  <Text style={styles.mobileNotificationType}>{notification.type}</Text>
                  <Text style={styles.mobileNotificationText}>{notification.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Icône de profil avec menu déroulant - Only on tablet */}
      {isTablet && (
        <TouchableOpacity style={styles.profileIcon} onPress={handleUserMenu}>
          <Ionicons name="person" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Menu déroulant de l'utilisateur */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowUserMenu(false)}
        >
          <View style={styles.userMenu}>
            {/* En-tête du menu avec infos utilisateur */}
            <View style={styles.userMenuHeader}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{(userInfo as any).fullName || 'Utilisateur'}</Text>
                <Text style={styles.userEmail}>{(userInfo as any).email || 'email@example.com'}</Text>
              </View>
            </View>

            {/* Options du menu */}
            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <Ionicons name="person-outline" size={20} color={colors.text} />
              <Text style={styles.menuText}>Informations personnelles</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
              <Text style={styles.menuText}>Paramètres de l'application</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu de partage */}
      <Modal
        visible={showShareMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowShareMenu(false)}
        >
          <View style={styles.shareMenu}>
            <View style={styles.shareMenuHeader}>
              <Text style={styles.shareMenuTitle}>Partager Syncalendar</Text>
              <TouchableOpacity onPress={() => setShowShareMenu(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: height * 0.6 }} showsVerticalScrollIndicator={false}>
              <View style={styles.shareOptions}>
                {/* Partage natif */}
                <TouchableOpacity style={styles.shareOption} onPress={handleShareViaNative}>
                  <View style={[styles.shareIcon, { backgroundColor: colors.primary }]}>
                    <Ionicons name="share-outline" size={24} color={colors.card} />
                  </View>
                  <Text style={styles.shareOptionText}>Partage général</Text>
                </TouchableOpacity>

                {/* WhatsApp */}
                <TouchableOpacity style={styles.shareOption} onPress={handleShareViaWhatsApp}>
                  <View style={[styles.shareIcon, { backgroundColor: '#25D366' }]}>
                    <Ionicons name="logo-whatsapp" size={24} color={colors.card} />
                  </View>
                  <Text style={styles.shareOptionText}>WhatsApp</Text>
                </TouchableOpacity>

                {/* Telegram */}
                <TouchableOpacity style={styles.shareOption} onPress={handleShareViaTelegram}>
                  <View style={[styles.shareIcon, { backgroundColor: '#0088cc' }]}>
                    <Ionicons name="paper-plane" size={24} color={colors.card} />
                  </View>
                  <Text style={styles.shareOptionText}>Telegram</Text>
                </TouchableOpacity>

                {/* Email */}
                <TouchableOpacity style={styles.shareOption} onPress={handleShareViaEmail}>
                  <View style={[styles.shareIcon, { backgroundColor: '#EA4335' }]}>
                    <Ionicons name="mail" size={24} color={colors.card} />
                  </View>
                  <Text style={styles.shareOptionText}>Email</Text>
                </TouchableOpacity>

                {/* SMS */}
                <TouchableOpacity style={styles.shareOption} onPress={handleShareViaSMS}>
                  <View style={[styles.shareIcon, { backgroundColor: '#34C759' }]}>
                    <Ionicons name="chatbubble" size={24} color={colors.card} />
                  </View>
                  <Text style={styles.shareOptionText}>SMS</Text>
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity style={styles.shareOption} onPress={handleShareViaFacebook}>
                  <View style={[styles.shareIcon, { backgroundColor: '#1877F2' }]}>
                    <Ionicons name="logo-facebook" size={24} color={colors.card} />
                  </View>
                  <Text style={styles.shareOptionText}>Facebook</Text>
                </TouchableOpacity>

                {/* Twitter */}
                <TouchableOpacity style={styles.shareOption} onPress={handleShareViaTwitter}>
                  <View style={[styles.shareIcon, { backgroundColor: '#1DA1F2' }]}>
                    <Ionicons name="logo-twitter" size={24} color={colors.card} />
                  </View>
                  <Text style={styles.shareOptionText}>Twitter</Text>
                </TouchableOpacity>

                {/* LinkedIn */}
                <TouchableOpacity style={styles.shareOption} onPress={handleShareViaLinkedIn}>
                  <View style={[styles.shareIcon, { backgroundColor: '#0A66C2' }]}>
                    <Ionicons name="logo-linkedin" size={24} color={colors.card} />
                  </View>
                  <Text style={styles.shareOptionText}>LinkedIn</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
             </Modal>

       {/* Month Picker Modal */}
       <Modal
         visible={showMonthPicker}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setShowMonthPicker(false)}
       >
         <TouchableOpacity 
           style={styles.modalOverlay} 
           activeOpacity={1} 
           onPress={() => setShowMonthPicker(false)}
         >
           <View style={styles.pickerMenu}>
             <View style={styles.pickerMenuHeader}>
               <Text style={styles.pickerMenuTitle}>Sélectionner un mois</Text>
               <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                 <Ionicons name="close" size={24} color={colors.text} />
               </TouchableOpacity>
             </View>

             <ScrollView style={{ maxHeight: height * 0.6 }} showsVerticalScrollIndicator={false}>
               <View style={styles.pickerOptions}>
                 {monthsInFrench.map((month, index) => (
                   <TouchableOpacity 
                     key={index} 
                     style={[
                       styles.pickerOption,
                       currentMonthIndex === index && styles.pickerOptionActive
                     ]} 
                     onPress={() => handleMonthSelect(index)}
                   >
                     <Text style={[
                       styles.pickerOptionText,
                       currentMonthIndex === index && styles.pickerOptionTextActive
                     ]}>
                       {month}
                     </Text>
                     {currentMonthIndex === index && (
                       <Ionicons name="checkmark" size={20} color={colors.primary} />
                     )}
                   </TouchableOpacity>
                 ))}
               </View>
             </ScrollView>
           </View>
         </TouchableOpacity>
       </Modal>

       {/* Year Picker Modal */}
       <Modal
         visible={showYearPicker}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setShowYearPicker(false)}
       >
         <TouchableOpacity 
           style={styles.modalOverlay} 
           activeOpacity={1} 
           onPress={() => setShowYearPicker(false)}
         >
           <View style={styles.pickerMenu}>
             <View style={styles.pickerMenuHeader}>
               <Text style={styles.pickerMenuTitle}>Sélectionner une année</Text>
               <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                 <Ionicons name="close" size={24} color={colors.text} />
               </TouchableOpacity>
             </View>

             <ScrollView style={{ maxHeight: height * 0.6 }} showsVerticalScrollIndicator={false}>
               <View style={styles.pickerOptions}>
                 {generateYearOptions().map((year) => (
                   <TouchableOpacity 
                     key={year} 
                     style={[
                       styles.pickerOption,
                       currentYear === year && styles.pickerOptionActive
                     ]} 
                     onPress={() => handleYearSelect(year)}
                   >
                     <Text style={[
                       styles.pickerOptionText,
                       currentYear === year && styles.pickerOptionTextActive
                     ]}>
                       {year}
                     </Text>
                     {currentYear === year && (
                       <Ionicons name="checkmark" size={20} color={colors.primary} />
                     )}
                   </TouchableOpacity>
                 ))}
               </View>
             </ScrollView>
           </View>
         </TouchableOpacity>
       </Modal>
       
       {/* Notification Toast */}
      {showToast && (
        <View style={[styles.toastContainer, 
          toastType === 'success' ? styles.toastSuccess : 
          toastType === 'warning' ? styles.toastWarning : 
          styles.toastInfo
        ]}>
          <Ionicons 
            name={toastType === 'success' ? 'checkmark-circle' : toastType === 'warning' ? 'warning' : 'information-circle'} 
            size={20} 
            color={toastType === 'success' ? colors.success : toastType === 'warning' ? colors.warning : colors.primary} 
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContent: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column',
    margin: getResponsivePadding(),
    backgroundColor: colors.card,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  
  // Mobile Header
  mobileHeader: {
    backgroundColor: colors.card,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingHorizontal: getResponsivePadding(),
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  mobileHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileHeaderTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 10,
    marginTop: 15,
  },
  profileIconMobile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  
  // Barre latérale gauche
  leftSidebar: {
    width: getSidebarWidth(),
    backgroundColor: colors.surface,
    padding: getResponsivePadding(),
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarIcon: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 15,
  },
  sidebarTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
    color: colors.text,
  },
  newEventButton: {
    backgroundColor: colors.primary,
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(16),
    borderRadius: 8,
    marginBottom: 30,
  },
  newEventText: {
    color: colors.card,
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  navigationMenu: {
    gap: 15,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: colors.primary,
  },
  navIcon: {
    width: getResponsiveSize(32),
    height: getResponsiveSize(32),
    borderRadius: getResponsiveSize(16),
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  navIconActive: {
    backgroundColor: colors.card,
  },
  navText: {
    fontSize: getResponsiveSize(14),
    color: colors.primary,
    fontWeight: '500',
  },
  navTextActive: {
    color: colors.card,
  },

  // Zone centrale - Calendrier
  calendarSection: {
    flex: 1,
    padding: getResponsivePadding(),
  },
  calendarHeader: {
    marginBottom: 20,
  },
  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navButton: {
    width: getResponsiveSize(44),
    height: getResponsiveSize(44),
    borderRadius: getResponsiveSize(22),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  monthYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthTitle: {
    fontSize: getResponsiveSize(isTablet ? 18 : 16),
    fontWeight: 'bold',
    color: colors.text,
  },
  yearTitle: {
    fontSize: getResponsiveSize(isTablet ? 18 : 16),
    fontWeight: 'bold',
    color: colors.text,
  },
  welcomeText: {
    fontSize: getResponsiveSize(isTablet ? 16 : 14),
    color: colors.textSecondary,
    marginTop: 5,
  },
  
  // Mobile Navigation
  mobileNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  mobileNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mobileNavButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mobileNavText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 5,
  },
  mobileNavTextPrimary: {
    color: colors.card,
  },
  
  calendarScrollView: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: getCalendarDaySize(),
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayHeader: {
    fontSize: getResponsiveSize(12),
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dayNumber: {
    fontSize: getResponsiveSize(14),
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  todayDay: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 8,
  },
  selectedDayContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  todayDayNumber: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  selectedDayNumber: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  eventDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  eventDot: {
    width: getResponsiveSize(6),
    height: getResponsiveSize(6),
    borderRadius: getResponsiveSize(3),
  },
  eventDotMargin: {
    marginLeft: 1,
  },
  moreEventsText: {
    fontSize: getResponsiveSize(8),
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginLeft: 2,
  },

  // Panneau latéral droit - Notifications
  rightSidebar: {
    width: getSidebarWidth(),
    backgroundColor: colors.surface,
    padding: getResponsivePadding(),
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  notificationsTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  notificationsScrollView: {
    flex: 1,
  },
  notificationsList: {
    gap: 15,
  },
  notificationCard: {
    backgroundColor: colors.card,
    padding: getResponsivePadding(),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationIcon: {
    width: getResponsiveSize(32),
    height: getResponsiveSize(32),
    borderRadius: getResponsiveSize(16),
    backgroundColor: colors.eventYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationContent: {
    gap: 4,
  },
  notificationType: {
    fontSize: getResponsiveSize(12),
    fontWeight: 'bold',
    color: colors.text,
  },
  notificationText: {
    fontSize: getResponsiveSize(11),
    color: colors.textSecondary,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: getResponsiveSize(10),
    color: colors.textSecondary,
    marginTop: 2,
  },
  noNotifications: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noNotificationsText: {
    fontSize: getResponsiveSize(14),
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },

  // Mobile Notifications Panel
  mobileNotificationsPanel: {
    backgroundColor: colors.surface,
    paddingVertical: 15,
    paddingHorizontal: getResponsivePadding(),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mobileNotificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mobileNotificationsTitle: {
    fontSize: getResponsiveSize(16),
    fontWeight: 'bold',
    color: colors.text,
  },
  mobileNotificationsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileNotificationsScroll: {
    flexDirection: 'row',
  },
  mobileNotificationCard: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 150,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mobileNotificationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.eventYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mobileNotificationContent: {
    gap: 2,
  },
  mobileNotificationType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
  },
  mobileNotificationText: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 14,
  },

  // Icône de profil
  profileIcon: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Menu déroulant de l'utilisateur
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMenu: {
    width: isTablet ? width * 0.7 : width * 0.9,
    backgroundColor: colors.card,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  userMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsivePadding(),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userAvatar: {
    width: getResponsiveSize(50),
    height: getResponsiveSize(50),
    borderRadius: getResponsiveSize(25),
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: getResponsiveSize(12),
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: getResponsivePadding(),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    fontSize: getResponsiveSize(16),
    color: colors.text,
    marginLeft: 15,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  
  // Styles pour les notifications toast
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  toastSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  toastInfo: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  toastWarning: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  toastText: {
    flex: 1,
    fontSize: getResponsiveSize(14),
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },

  // Styles pour le menu de partage
  shareMenu: {
    width: isTablet ? width * 0.8 : width * 0.95,
    backgroundColor: colors.card,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  shareMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsivePadding(),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shareMenuTitle: {
    fontSize: getResponsiveSize(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  shareOptions: {
    padding: getResponsivePadding(),
    gap: 15,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareIcon: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  shareOptionText: {
    fontSize: getResponsiveSize(16),
    color: colors.text,
    fontWeight: '500',
  },

  // Styles pour les pickers de mois et année
  pickerMenu: {
    width: isTablet ? width * 0.8 : width * 0.95,
    backgroundColor: colors.card,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  pickerMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsivePadding(),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerMenuTitle: {
    fontSize: getResponsiveSize(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  pickerOptions: {
    padding: getResponsivePadding(),
    gap: 10,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: getResponsiveSize(16),
    color: colors.text,
    fontWeight: '500',
  },
  pickerOptionTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
}); 