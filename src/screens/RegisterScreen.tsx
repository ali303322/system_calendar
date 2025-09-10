import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
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
import { RegisterCredentials } from '../types';

interface RegisterScreenProps {
  navigation: any;
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
  onLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
  onRegister,
  onLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [successMessage, setSuccessMessage] = useState('');
  const [progressAnim] = useState(new Animated.Value(0));
  const [progressText, setProgressText] = useState('0% complété');

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animation de la barre de progression
  useEffect(() => {
    const progress = Math.min(100, ((name.trim() ? 1 : 0) + (email.trim() ? 1 : 0) + (password ? 1 : 0) + (confirmPassword ? 1 : 0)) * 25);
    setProgressText(`${Math.round(progress)}% complété`);
    
    // Haptic feedback quand le formulaire est complété
    if (progress === 100 && Object.keys(errors).length === 0) {
      // On pourrait ajouter une vibration ici si on avait accès à Haptics
      console.log('Formulaire complété !');
    }
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [name, email, password, confirmPassword, errors]);

  // Réinitialiser le message de succès quand les champs changent
  useEffect(() => {
    if (successMessage) {
      setSuccessMessage('');
    }
  }, [name, email, password, confirmPassword]);

  // Validation en temps réel
  useEffect(() => {
    if (name.trim()) {
      validateField('name', name);
    }
  }, [name]);

  useEffect(() => {
    if (email.trim()) {
      validateField('email', email);
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      validateField('password', password);
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      validateField('confirmPassword', confirmPassword);
    }
  }, [confirmPassword]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Le nom est requis';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Le nom doit contenir au moins 2 caractères';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          newErrors.email = 'L\'email n\'est pas valide';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Le mot de passe est requis';
        } else if (value.length < 8) {
          newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password = 'Le mot de passe doit contenir au moins une lettre minuscule';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = 'Le mot de passe doit contenir au moins une lettre majuscule';
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = 'Le mot de passe doit contenir au moins un chiffre';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
        } else if (password !== value) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validation du nom
    if (!name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation de l'email
    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    // Validation du mot de passe
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une lettre minuscule';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une lettre majuscule';
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins un chiffre';
    }

    // Validation de la confirmation du mot de passe
    if (!confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post("http://192.168.11.122:8000/auth/register", {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });
  
      if (response.data?.token) {
        Alert.alert(
          "Succès 🎉",
          `Bienvenue ${name.trim()} ! Votre compte a été créé avec succès.`,
          [{ text: "Se connecter", onPress: () => onLogin() }]
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de créer le compte. Vérifiez vos informations.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleLoginPress = () => {
    onLogin();
  };

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: colors.textSecondary };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[!@#$%^&*])/.test(password)) score++;

    const strengthMap = [
      { label: 'Très faible', color: colors.error },
      { label: 'Faible', color: colors.warning },
      { label: 'Moyen', color: colors.warning },
      { label: 'Bon', color: colors.success },
      { label: 'Très bon', color: colors.success },
    ];

    return { score, ...strengthMap[Math.min(score - 1, 4)] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Ionicons name="person-add" size={64} color={colors.primary} />
                <Text style={styles.title}>Créer un compte</Text>
                <Text style={styles.subtitle}>
                  Rejoignez Syncalendar pour organiser votre temps efficacement
                </Text>
              </View>
            </View>

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Message de succès */}
              {successMessage && (
                <View style={styles.successMessage}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              )}

              {/* Indicateur de progression */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: progressAnim,
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {progressText}
                </Text>
              </View>

              <Input
                label="Nom complet *"
                value={name}
                onChangeText={setName}
                placeholder="Votre nom complet"
                error={errors.name}
                leftIcon={<Ionicons name="person" size={20} color={colors.textSecondary} />}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  // Focus sur le champ email
                }}
              />

              <Input
                label="Adresse email *"
                value={email}
                onChangeText={setEmail}
                placeholder="votre.email@exemple.com"
                error={errors.email}
                leftIcon={<Ionicons name="mail" size={20} color={colors.textSecondary} />}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  // Focus sur le champ mot de passe
                }}
              />

              <Input
                label="Mot de passe *"
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                error={errors.password}
                leftIcon={<Ionicons name="lock-closed" size={20} color={colors.textSecondary} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                }
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  // Focus sur le champ confirmation
                }}
              />

              {/* Indicateur de force du mot de passe amélioré */}
              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.passwordStrengthHeader}>
                    <Text style={styles.passwordStrengthLabel}>
                      Force du mot de passe
                    </Text>
                    <Text style={[styles.passwordStrengthScore, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                  <View style={styles.passwordStrengthBar}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.passwordStrengthSegment,
                          level <= passwordStrength.score && {
                            backgroundColor: passwordStrength.color,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.passwordRequirements}>
                    <Text style={[styles.requirement, password.length >= 8 && styles.requirementMet]}>
                      • Au moins 8 caractères
                    </Text>
                    <Text style={[styles.requirement, /(?=.*[a-z])/.test(password) && styles.requirementMet]}>
                      • Une lettre minuscule
                    </Text>
                    <Text style={[styles.requirement, /(?=.*[A-Z])/.test(password) && styles.requirementMet]}>
                      • Une lettre majuscule
                    </Text>
                    <Text style={[styles.requirement, /(?=.*\d)/.test(password) && styles.requirementMet]}>
                      • Un chiffre
                    </Text>
                  </View>
                </View>
              )}

              <Input
                label="Confirmer le mot de passe *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmez votre mot de passe"
                error={errors.confirmPassword}
                leftIcon={<Ionicons name="lock-closed" size={20} color={colors.textSecondary} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                }
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Conditions d'utilisation */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  En créant un compte, vous acceptez nos{' '}
                  <Text style={styles.termsLink}>conditions d'utilisation</Text>
                  {' '}et notre{' '}
                  <Text style={styles.termsLink}>politique de confidentialité</Text>
                </Text>
              </View>

              {/* Bouton d'inscription */}
              <Button
                title="Créer mon compte"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
                fullWidth
                disabled={Object.keys(errors).length > 0 || !name.trim() || !email.trim() || !password || !confirmPassword}
              />

              {/* Séparateur */}
              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>ou</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* Bouton de connexion */}
              <Button
                title="Se connecter"
                onPress={handleLoginPress}
                variant="outline"
                style={styles.loginButton}
                fullWidth
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Vous avez déjà un compte ?{' '}
                <TouchableOpacity onPress={handleLoginPress}>
                  <Text style={styles.footerLink}>Se connecter</Text>
                </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  passwordStrength: {
    marginTop: -8,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordStrengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  passwordStrengthScore: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  passwordRequirements: {
    gap: 6,
  },
  requirement: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  requirementMet: {
    color: colors.success,
    fontWeight: '500',
  },
  termsContainer: {
    marginTop: 8,
  },
  termsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginButton: {
    borderColor: colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '500',
  },
}); 