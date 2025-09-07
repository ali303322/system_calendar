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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem("authToken");
      setToken(storedToken);
      setLoading(false);
    };
    checkToken();
  }, []);

  if (loading) return null; // or splash screen

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     setIsAuthenticated(false); // Start always disconnected for demo
  //   };
  //   checkAuth();
  // }, []);

const handleLogin = async (token: string, user: User) => {
  try {
    // Save token in storage
    if (Platform.OS === "web") {
      localStorage.setItem("authToken", token);
    } else {
      await AsyncStorage.setItem("authToken", token);
    }

    // Update global state
    setToken(token);
    setUser(user);
  } catch (err) {
    console.error("Login error:", err);
  }
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



  if (!token) {
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