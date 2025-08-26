import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { User } from '../types';

interface ProfileScreenProps {
  user: User | null;
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  // États pour l'édition du profil
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  
  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleEditProfile = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    // Ici on pourrait appeler un service pour sauvegarder
    Alert.alert(
      'Profil mis à jour',
      'Vos informations ont été sauvegardées avec succès !',
      [{ text: 'OK', onPress: () => setShowEditModal(false) }]
    );
  };

  const handleChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    // Ici on pourrait appeler un service pour changer le mot de passe
    Alert.alert(
      'Mot de passe mis à jour',
      'Votre mot de passe a été changé avec succès !',
      [{ text: 'OK', onPress: () => setShowPasswordModal(false) }]
    );
  };

  const handlePrivacySettings = () => {
    setShowPrivacyModal(true);
  };

  const handleAbout = () => {
    setShowAboutModal(true);
  };

  const handleToggleDarkMode = (value: boolean) => {
    setDarkModeEnabled(value);
    Alert.alert(
      'Mode sombre',
      value ? 'Mode sombre activé' : 'Mode sombre désactivé',
      [{ text: 'OK' }]
    );
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    Alert.alert(
      'Notifications',
      value ? 'Notifications activées' : 'Notifications désactivées',
      [{ text: 'OK' }]
    );
  };

  const handleToggleSound = (value: boolean) => {
    setSoundEnabled(value);
    Alert.alert(
      'Sons',
      value ? 'Sons activés' : 'Sons désactivés',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* En-tête du profil */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {/* Informations de l'utilisateur */}
      <View style={styles.userSection}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={60} color={colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Text style={styles.editProfileText}>Modifier le profil</Text>
        </TouchableOpacity>
      </View>

      {/* Paramètres de l'application */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Paramètres de l'application</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color={colors.primary} />
            <Text style={styles.settingText}>Mode sombre</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={darkModeEnabled ? colors.primary : colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={24} color={colors.primary} />
            <Text style={styles.settingText}>Sons</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={handleToggleSound}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={soundEnabled ? colors.primary : colors.textSecondary}
          />
        </View>
      </View>

      {/* Autres options */}
      <View style={styles.optionsSection}>
        <TouchableOpacity style={styles.optionItem} onPress={handleChangePassword}>
          <Ionicons name="lock-closed" size={24} color={colors.primary} />
          <Text style={styles.optionText}>Changer le mot de passe</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={handlePrivacySettings}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={styles.optionText}>Confidentialité</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={handleAbout}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.optionText}>À propos</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Modal d'édition du profil */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nom complet</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Votre nom complet"
              />
              
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="votre@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de changement de mot de passe */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Mot de passe actuel</Text>
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Votre mot de passe actuel"
                secureTextEntry
              />
              
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nouveau mot de passe"
                secureTextEntry
              />
              
              <Text style={styles.inputLabel}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={styles.textInput}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Confirmer le nouveau mot de passe"
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSavePassword}
              >
                <Text style={styles.saveButtonText}>Changer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confidentialité */}
      <Modal
        visible={showPrivacyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Paramètres de confidentialité</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.privacyText}>
                Vos données personnelles sont protégées et ne sont jamais partagées avec des tiers sans votre consentement explicite.
              </Text>
              
              <View style={styles.privacyOption}>
                <Text style={styles.privacyOptionTitle}>Partage de données</Text>
                <Text style={styles.privacyOptionDesc}>
                  Nous ne partageons vos données qu'avec votre consentement explicite
                </Text>
              </View>
              
              <View style={styles.privacyOption}>
                <Text style={styles.privacyOptionTitle}>Stockage sécurisé</Text>
                <Text style={styles.privacyOptionDesc}>
                  Toutes vos données sont chiffrées et stockées de manière sécurisée
                </Text>
              </View>
              
              <View style={styles.privacyOption}>
                <Text style={styles.privacyOptionTitle}>Contrôle des données</Text>
                <Text style={styles.privacyOptionDesc}>
                  Vous pouvez à tout moment supprimer vos données de notre plateforme
                </Text>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.saveButtonText}>Compris</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal À propos */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>À propos de Syncalendar</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.aboutLogo}>
                <Ionicons name="calendar" size={60} color={colors.primary} />
              </View>
              
              <Text style={styles.aboutTitle}>Syncalendar</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
              
              <Text style={styles.aboutDescription}>
                Syncalendar est une application de gestion de calendrier moderne et intuitive, 
                conçue pour vous aider à organiser votre temps efficacement.
              </Text>
              
              <View style={styles.aboutFeatures}>
                <Text style={styles.aboutFeaturesTitle}>Fonctionnalités principales :</Text>
                <Text style={styles.aboutFeature}>• Gestion d'événements intuitive</Text>
                <Text style={styles.aboutFeature}>• Notifications personnalisables</Text>
                <Text style={styles.aboutFeature}>• Interface moderne et responsive</Text>
                <Text style={styles.aboutFeature}>• Synchronisation multi-appareils</Text>
                <Text style={styles.aboutFeature}>• Mode sombre</Text>
              </View>
              
              <Text style={styles.aboutCopyright}>
                © 2025 Syncalendar. Tous droits réservés.
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={() => setShowAboutModal(false)}
              >
                <Text style={styles.saveButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  userSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: colors.card,
    margin: 20,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  userAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  editProfileText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: colors.card,
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  optionsSection: {
    backgroundColor: colors.card,
    margin: 20,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'justify',
  },
  privacyOption: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  privacyOptionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  aboutLogo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  aboutVersion: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  aboutDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'justify',
    marginBottom: 20,
  },
  aboutFeatures: {
    marginBottom: 20,
  },
  aboutFeaturesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  aboutFeature: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  aboutCopyright: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 