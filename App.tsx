import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/constants/Colors';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { EventDetailsScreen } from './src/screens/EventDetailsScreen';
import { EventFormScreen } from './src/screens/EventFormScreen';
import { EventsListScreen } from './src/screens/EventsListScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { LoginCredentials, RegisterCredentials, User } from './src/types';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthenticated(false); // Start always disconnected for demo
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    console.log('Tentative de connexion avec:', credentials);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer un utilisateur basé sur les credentials
    const newUser: User = {
      id: '1',
      email: credentials.email,
      name: credentials.email.split('@')[0] || 'Utilisateur'
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const handleRegister = async (credentials: RegisterCredentials) => {
    console.log('Tentative d\'inscription avec:', credentials);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: '1',
      email: credentials.email,
      name: credentials.name || 'Utilisateur'
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    setUser(null);
    setIsAuthenticated(false);
  };



  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background }
            }}
          >
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                />
              )}
            </Stack.Screen>
                         <Stack.Screen name="Register">
               {(props) => (
                 <RegisterScreen
                   {...props}
                   onLogin={() => props.navigation.navigate('Login')}
                   onRegister={handleRegister}
                 />
               )}
             </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="Calendar">
            {(props) => (
              <CalendarScreen
                {...props}
                user={user}
                onLogout={handleLogout}
                navigation={props.navigation}
              />
            )}
          </Stack.Screen>
                               <Stack.Screen name="EventForm">
            {(props) => (
              <EventFormScreen
                {...props}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="EventDetails">
            {(props) => (
              <EventDetailsScreen
                {...props}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Notifications">
            {(props) => (
              <NotificationsScreen
                {...props}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Profile">
            {(props) => (
              <ProfileScreen
                {...props}
                user={user}
                navigation={props.navigation}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="EventsList">
            {(props) => (
              <EventsListScreen
                {...props}
                user={user}
                navigation={props.navigation}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}