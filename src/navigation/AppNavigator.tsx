import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
// Linking config pour le web
const linking = {
  prefixes: ['/', 'http://localhost', 'https://localhost'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      Main: {
        screens: {
          Calendar: 'calendar',
          Notifications: 'notifications',
        },
      },
      EventForm: 'event/new',
      EventDetails: 'event/:id',
    },
  },
};

import { colors } from '../constants/Colors';
import { CalendarScreen } from '../screens/CalendarScreen';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { EventFormScreen } from '../screens/EventFormScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { Event, LoginCredentials, RegisterCredentials } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EventForm: { event?: Event };
  EventDetails: { event: Event };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Calendar: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

interface AppNavigatorProps {
  isAuthenticated: boolean;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
  onLogout: () => Promise<void>;
  onSaveEvent: (eventData: Partial<Event>) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onReloadEvents: () => Promise<void>;
  events: Event[];
  loading: boolean;
}

const AuthNavigator = ({ onLogin, onRegister }: {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
}) => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <AuthStack.Screen name="Login">
      {(props) => <LoginScreen {...props} onLogin={onLogin} onRegister={onRegister} />}
    </AuthStack.Screen>
    <AuthStack.Screen name="Register">
      {(props) => <RegisterScreen {...props} onLogin={onLogin} onRegister={onRegister} />}
    </AuthStack.Screen>
  </AuthStack.Navigator>
);

const MainTabNavigator = ({ 
  events, 
  onEventPress, 
  onAddEvent, 
  onReloadEvents,
  onLogout 
}: {
  events: Event[];
  onEventPress: (event: Event) => void;
  onAddEvent: () => void;
  onReloadEvents: () => Promise<void>;
  onLogout: () => Promise<void>;
}) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Calendar') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Notifications') {
          iconName = focused ? 'notifications' : 'notifications-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Calendar" 
      options={{ 
        title: 'Calendrier',
        headerRight: () => (
          <TouchableOpacity onPress={onAddEvent} style={{ marginRight: 15 }}>
            <Ionicons 
              name="add-circle" 
              size={24} 
              color={colors.primary}
            />
          </TouchableOpacity>
        ),
      }}
    >
      {(props) => (
        <CalendarScreen
          {...props}
          events={events}
          onEventPress={onEventPress}
          onAddEvent={onAddEvent}
          onReloadEvents={onReloadEvents}
        />
      )}
    </Tab.Screen>
    <Tab.Screen 
      name="Notifications" 
      options={{ 
        title: 'Notifications',
        headerRight: () => (
          <TouchableOpacity onPress={onLogout} style={{ marginRight: 15 }}>
            <Ionicons 
              name="log-out-outline" 
              size={24} 
              color={colors.error}
            />
          </TouchableOpacity>
        ),
      }}
    >
      {(props) => (
        <NotificationsScreen
          {...props}
          onLogout={onLogout}
        />
      )}
    </Tab.Screen>
  </Tab.Navigator>
);

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  isAuthenticated,
  onLogin,
  onRegister,
  onLogout,
  onSaveEvent,
  onDeleteEvent,
  onReloadEvents,
  events,
  loading,
}) => {
  const handleEventPress = (event: Event) => {
    // Navigation vers les détails de l'événement
    // Cette fonction sera gérée par le composant parent
  };

  const handleAddEvent = () => {
    // Navigation vers le formulaire d'événement
    // Cette fonction sera gérée par le composant parent
  };

  return (
    <NavigationContainer linking={Platform.OS === 'web' ? linking : undefined}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator onLogin={onLogin} onRegister={onRegister} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => (
                <MainTabNavigator
                  events={events}
                  onEventPress={handleEventPress}
                  onAddEvent={handleAddEvent}
                  onReloadEvents={onReloadEvents}
                  onLogout={onLogout}
                />
              )}
            </Stack.Screen>
            <Stack.Screen 
              name="EventForm" 
              component={EventFormScreen}
              options={{ 
                title: 'Nouvel événement',
                headerShown: true,
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="EventDetails" 
              component={EventDetailsScreen}
              options={{ 
                title: 'Détails de l\'événement',
                headerShown: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};