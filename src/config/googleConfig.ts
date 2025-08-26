// Configuration Google OAuth
// Remplacez ces valeurs par vos vrais identifiants Google

export const GOOGLE_CONFIG = {
  // Identifiants de développement (à remplacer par vos vrais identifiants)
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID',
  CLIENT_SECRET: 'YOUR_GOOGLE_CLIENT_SECRET',
  
  // URLs de redirection
  REDIRECT_URI: 'syncalendar://auth',
  
  // Scopes demandés
  SCOPES: ['openid', 'profile', 'email'],
  
  // Configuration de découverte OAuth
  DISCOVERY: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  },
};

// Instructions pour configurer Google OAuth :
/*
1. Allez sur https://console.developers.google.com/
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API
4. Allez dans "Identifiants" > "Créer des identifiants" > "ID client OAuth 2.0"
5. Configurez l'écran de consentement OAuth
6. Ajoutez les URIs de redirection autorisés :
   - syncalendar://auth (pour mobile)
   - http://localhost:19006 (pour web)
   - https://your-domain.com (pour production)
7. Copiez le Client ID et Client Secret dans ce fichier
8. Mettez à jour app.json avec les mêmes valeurs
*/

export const isGoogleConfigured = (): boolean => {
  return GOOGLE_CONFIG.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' && 
         GOOGLE_CONFIG.CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET';
}; 