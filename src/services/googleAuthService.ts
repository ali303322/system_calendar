import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { GOOGLE_CONFIG, isGoogleConfigured } from '../config/googleConfig';

// Configuration des redirections
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'syncalendar',
  path: 'auth',
});

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export class GoogleAuthService {
  static async signIn(): Promise<GoogleUser | null> {
    try {
      // Vérifier si Google est configuré
      if (!isGoogleConfigured()) {
        console.warn('Google OAuth non configuré, utilisation de la simulation');
        return this.simulateGoogleSignIn();
      }

      // En mode développement, utiliser une simulation si pas configuré
      if (__DEV__ && !isGoogleConfigured()) {
        console.log('Mode développement détecté, utilisation de la simulation Google');
        return this.simulateGoogleSignIn();
      }

      // Créer la requête d'authentification
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CONFIG.CLIENT_ID,
        scopes: GOOGLE_CONFIG.SCOPES,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
        },
      });

      // Lancer l'authentification
      const result = await request.promptAsync(GOOGLE_CONFIG.DISCOVERY);

      if (result.type === 'success' && result.params.code) {
        // Échanger le code contre un token
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: GOOGLE_CONFIG.CLIENT_ID,
            clientSecret: GOOGLE_CONFIG.CLIENT_SECRET,
            code: result.params.code,
            redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          GOOGLE_CONFIG.DISCOVERY
        );

        if (tokenResult.accessToken) {
          // Récupérer les informations de l'utilisateur
          const userInfo = await this.getUserInfo(tokenResult.accessToken);
          return userInfo;
        }
      } else if (result.type === 'cancel') {
        console.log('Authentification Google annulée par l\'utilisateur');
        return null;
      } else {
        console.error('Erreur lors de l\'authentification Google:', result);
        throw new Error('Échec de l\'authentification Google');
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      
      // En cas d'erreur en mode développement, utiliser la simulation
      if (__DEV__) {
        console.log('Utilisation de la simulation Google en mode développement');
        return this.simulateGoogleSignIn();
      }
      
      throw new Error('Échec de l\'authentification Google');
    }
  }

  // Simulation pour le développement
  private static async simulateGoogleSignIn(): Promise<GoogleUser> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Retourner un utilisateur de test
    return {
      id: 'google_dev_' + Date.now(),
      email: 'user.google@gmail.com',
      name: 'User Google',
      picture: 'https://ui-avatars.com/api/?name=User+Google&background=4285F4&color=fff',
      given_name: 'User',
      family_name: 'Google',
    };
  }

  private static async getUserInfo(accessToken: string): Promise<GoogleUser> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Impossible de récupérer les informations utilisateur');
      }

      const userData = await response.json();
      
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        given_name: userData.given_name,
        family_name: userData.family_name,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      throw new Error('Impossible de récupérer les informations utilisateur');
    }
  }

  static async signOut(): Promise<void> {
    try {
      // Révoquer le token si nécessaire
      // Note: Cette fonctionnalité nécessite un token de rafraîchissement
      console.log('Déconnexion Google effectuée');
    } catch (error) {
      console.error('Erreur lors de la déconnexion Google:', error);
    }
  }

  // Méthode pour vérifier si l'utilisateur est connecté
  static async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      // Vérifier s'il y a un token valide en cache
      const token = AuthSession.getDefaultReturnUrl();
      if (token) {
        // Vérifier la validité du token et récupérer les infos utilisateur
        return null; // À implémenter selon vos besoins
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      return null;
    }
  }

  // Méthode pour vérifier si l'authentification Google est configurée
  static isConfigured(): boolean {
    return isGoogleConfigured();
  }

  // Méthode pour obtenir le statut de configuration
  static getConfigurationStatus(): {
    isConfigured: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  } {
    return {
      isConfigured: isGoogleConfigured(),
      clientId: GOOGLE_CONFIG.CLIENT_ID,
      clientSecret: GOOGLE_CONFIG.CLIENT_SECRET,
      redirectUri,
    };
  }
} 