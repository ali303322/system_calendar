# Configuration de l'authentification Google pour Syncalendar

## 🚨 DÉPANNAGE RAPIDE

### Problème : "Impossible de se connecter avec Google"

**Solution immédiate :**
1. **Mode développement** : L'authentification Google utilise actuellement une simulation
2. **Pour une vraie authentification** : Suivez les étapes de configuration ci-dessous

### Vérification rapide :
```bash
# Vérifiez que les identifiants sont configurés
# Dans src/config/googleConfig.ts :
CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID'  # ❌ Non configuré
CLIENT_SECRET: 'YOUR_GOOGLE_CLIENT_SECRET'  # ❌ Non configuré
```

---

## Prérequis

1. Un compte Google Developer
2. Expo CLI installé
3. Node.js et npm

## Étapes de configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez la facturation si nécessaire

### 2. Activer les APIs nécessaires

1. Dans la console Google Cloud, allez dans "APIs et services" > "Bibliothèque"
2. Recherchez et activez les APIs suivantes :
   - Google+ API
   - Google Identity API
   - Google OAuth2 API

### 3. Configurer l'écran de consentement OAuth

1. Allez dans "APIs et services" > "Écran de consentement OAuth"
2. Sélectionnez "Externe" (si vous n'avez pas de compte Google Workspace)
3. Remplissez les informations requises :
   - Nom de l'application : Syncalendar
   - Email de support utilisateur
   - Logo de l'application (optionnel)
   - Domaine de l'application
   - Email de contact du développeur

### 4. Créer les identifiants OAuth

1. Allez dans "APIs et services" > "Identifiants"
2. Cliquez sur "Créer des identifiants" > "ID client OAuth 2.0"
3. Sélectionnez "Application mobile" comme type d'application
4. Donnez un nom à votre client OAuth (ex: "Syncalendar Mobile")
5. Cliquez sur "Créer"

### 5. Configurer les URIs de redirection

1. Dans les détails de votre client OAuth, ajoutez les URIs de redirection autorisés :
   ```
   syncalendar://auth
   http://localhost:19006
   https://your-domain.com (pour la production)
   ```

### 6. Récupérer les identifiants

1. Copiez le **Client ID** et le **Client Secret**
2. Notez ces informations en lieu sûr

### 7. Mettre à jour la configuration de l'application

1. Ouvrez le fichier `src/config/googleConfig.ts`
2. Remplacez les valeurs par défaut par vos vrais identifiants :
   ```typescript
   export const GOOGLE_CONFIG = {
     CLIENT_ID: 'votre-vrai-client-id.apps.googleusercontent.com',
     CLIENT_SECRET: 'votre-vrai-client-secret',
     // ... autres configurations
   };
   ```

3. Mettez à jour le fichier `app.json` :
   ```json
   {
     "expo": {
       "extra": {
         "googleClientId": "votre-vrai-client-id.apps.googleusercontent.com",
         "googleClientSecret": "votre-vrai-client-secret"
       }
     }
   }
   ```

### 8. Tester l'authentification

1. Redémarrez votre application Expo
2. Testez la connexion avec Google
3. Vérifiez que l'authentification fonctionne correctement

## Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URI de redirection dans Google Cloud Console correspond exactement à `syncalendar://auth`
- Assurez-vous qu'il n'y a pas d'espaces supplémentaires

### Erreur "invalid_client"
- Vérifiez que le Client ID et Client Secret sont corrects
- Assurez-vous que l'application est bien configurée pour mobile

### Erreur "access_denied"
- Vérifiez que l'écran de consentement OAuth est correctement configuré
- Assurez-vous que les APIs nécessaires sont activées

### Erreur "Échec de l'authentification Google"
- Vérifiez que tous les identifiants sont correctement configurés
- Assurez-vous que l'application est en mode production ou que la simulation fonctionne

## Sécurité

⚠️ **Important** : Ne partagez jamais vos identifiants Google en public
- Le Client Secret doit rester confidentiel
- Utilisez des variables d'environnement en production
- Ne committez jamais les vrais identifiants dans Git

## Variables d'environnement (recommandé)

Pour une meilleure sécurité, utilisez des variables d'environnement :

1. Créez un fichier `.env` :
   ```
   GOOGLE_CLIENT_ID=votre-client-id
   GOOGLE_CLIENT_SECRET=votre-client-secret
   ```

2. Installez `react-native-dotenv` :
   ```bash
   npm install react-native-dotenv
   ```

3. Configurez babel.config.js pour utiliser les variables d'environnement

## Support

Si vous rencontrez des problèmes :
1. Vérifiez la documentation officielle Google OAuth
2. Consultez les logs de la console Google Cloud
3. Vérifiez que toutes les étapes ont été suivies correctement
4. En mode développement, l'authentification utilise une simulation par défaut 