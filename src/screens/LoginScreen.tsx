import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors } from '../constants/Colors';
import { GoogleAuthService } from '../services/googleAuthService';
import { LoginCredentials, RegisterCredentials } from '../types';

interface LoginScreenProps {
  navigation: any;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
  onLogin,
  onRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
  
    try {
      const response = await axios.post("http://192.168.1.35:8000/auth/login", {
        email: email.trim().toLowerCase(),
        password: password,
      });
  
             if (response.data?.token) {
         await AsyncStorage.setItem("authToken", response.data.token);
   
         // Call the onLogin function to trigger authentication state change
      await onLogin({ email: email.trim(), password });
   
         Alert.alert("Succès 🎉", "Connexion réussie !", [
           {
             text: "Continuer",
             onPress: () => {
               // The app will automatically show the authenticated stack
               console.log("User authenticated successfully");
             },
           },
         ]);
       } else {
        Alert.alert("Erreur", "Réponse invalide du serveur");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };
  

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      
      // Vérifier la configuration Google
      const configStatus = GoogleAuthService.getConfigurationStatus();
      console.log('Statut configuration Google:', configStatus);
      
      // Utiliser le vrai service d'authentification Google
      const googleUser = await GoogleAuthService.signIn();
      
      if (googleUser) {
        try {
          // Appel à l'API de connexion avec les données Google
          const response = await axios.post("http://192.168.1.35:8000/auth/login", {
          email: googleUser.email,
          password: `google_auth_${googleUser.id}`, // Mot de passe spécial pour les utilisateurs Google
          });

                     if (response.data?.token) {
             // Stocker le token dans AsyncStorage
             await AsyncStorage.setItem('authToken', response.data.token);
             
             // Stocker les informations utilisateur si disponibles
             if (response.data.user) {
               await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
             }

             // Call the onLogin function to trigger authentication state change
             await onLogin({ 
               email: googleUser.email, 
               password: `google_auth_${googleUser.id}` 
             });
        
        // Afficher un message de bienvenue
        Alert.alert(
          'Bienvenue sur Syncalendar ! 🎉',
          `Bonjour ${googleUser.name} !\n\nVotre compte Google a été connecté avec succès. Vous pouvez maintenant organiser vos événements !`,
               [
                 { 
                   text: 'Commencer', 
                   onPress: () => {
                     // The app will automatically show the authenticated stack
                     console.log("Google user authenticated successfully");
                   }
                 }
               ]
             );
           } else {
            Alert.alert("Erreur", "Réponse invalide du serveur");
          }
        } catch (error: any) {
          console.error('Erreur de connexion Google:', error);
          
          let errorMessage = "Impossible de se connecter avec Google.";
          
          if (error.response) {
            if (error.response.status === 401) {
              errorMessage = "Compte Google non autorisé";
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
          } else if (error.request) {
            errorMessage = "Erreur de connexion réseau. Vérifiez votre connexion internet.";
          }
          
          Alert.alert("Erreur de connexion Google", errorMessage);
        }
      } else {
        Alert.alert(
          'Connexion annulée',
          'La connexion avec Google a été annulée.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Erreur Google Auth:', error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Impossible de se connecter avec Google. Veuillez vérifier votre connexion internet et réessayer.';
      
      if (error instanceof Error) {
        if (error.message.includes('redirect_uri_mismatch')) {
          errorMessage = 'Erreur de configuration Google OAuth. L\'URI de redirection ne correspond pas.';
        } else if (error.message.includes('invalid_client')) {
          errorMessage = 'Erreur de configuration Google OAuth. Identifiants client invalides.';
        } else if (error.message.includes('access_denied')) {
          errorMessage = 'Accès refusé. Veuillez autoriser l\'accès à votre compte Google.';
        } else if (error.message.includes('Échec de l\'authentification Google')) {
          errorMessage = 'Échec de l\'authentification Google. Vérifiez votre configuration OAuth.';
        }
      }
      
      Alert.alert(
        'Erreur de connexion Google', 
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              { opacity: fadeAnim },
              Platform.OS === 'web' && styles.webCenterContainer
            ]}
          >
            {/* En-tête */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="calendar" size={50} color={colors.primary} />
              </View>
              <Text style={styles.title}>Syncalendar</Text>
              <Text style={styles.subtitle}>Gérez vos événements en toute simplicité</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
              />

              <Input
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                secureTextEntry={!showPassword}
                error={errors.password}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                }
              />

              <View style={styles.buttonContainer}>
                <Button
                  title="Se connecter"
                  onPress={handleLogin}
                  loading={loading}
                  style={styles.loginButton}
                  fullWidth
                />
                
                <TouchableOpacity
                  style={[styles.googleButton, styles.fullWidth, googleLoading && styles.googleButtonLoading]}
                  onPress={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  activeOpacity={0.8}
                >
                  {googleLoading ? (
                    <>
                      <View style={styles.loadingSpinner} />
                      <Text style={styles.googleButtonText}>Connexion Google en cours...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
                      <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                    </>
                  )}
                </TouchableOpacity>

              </View>
            </View>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Bouton d'inscription */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>
                Vous n'avez pas de compte ?
              </Text>
              <Button
                title="Créer un compte"
                onPress={handleRegisterPress}
                variant="outline"
                style={styles.registerButton}
                fullWidth
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                En continuant, vous acceptez nos{' '}
                <Text style={styles.footerLink}>conditions d'utilisation</Text>
                {' '}et notre{' '}
                <Text style={styles.footerLink}>politique de confidentialité</Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
    ...(Platform.OS === 'web' ? { maxWidth: 360, width: '100%', alignSelf: 'center' } : {}),
  },
  webCenterContainer: {
    maxWidth: 400,
    width: '100%',
    marginHorizontal: 'auto',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    boxShadow: '0 2px 16px #0002',
    padding: 32,
  },
  buttonContainer: {
    gap: 16,
    marginTop: 24,
  },
  loginButton: {
    backgroundColor: colors.primary,
  },
  googleButton: {
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  googleIcon: {
    marginRight: 8,
  },
  registerButton: {
    borderColor: colors.primary,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textSecondary,
  },
  separatorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  registerSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  fullWidth: {
    width: '100%',
  },
  googleButtonLoading: {
    opacity: 0.7,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4285F4',
    borderTopColor: 'transparent',
    marginRight: 10,
  },
}); 