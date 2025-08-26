# Syncalendar - Application de Calendrier Moderne

## 🎨 Design Exact de l'Interface

Cette application reproduit fidèlement le design moderne et épuré montré dans l'image de référence, avec :

### ✨ Caractéristiques du Design

- **Design Neumorphic/Glassmorphic** : Interface avec des ombres subtiles et des effets de profondeur
- **Palette de couleurs harmonieuse** : Blanc, gris clair, bleu et accents colorés
- **Layout en 3 colonnes** : Navigation gauche, calendrier central, notifications droite
- **Typographie moderne** : Hiérarchie claire avec différentes graisses de police

### 🎯 Structure de l'Interface

#### 1. Barre Latérale Gauche (20% de la largeur)
- **En-tête** : Icône de calendrier + titre "Calendar"
- **Bouton "New Event"** : Bouton bleu principal pour créer des événements
- **Menu de navigation** :
  - Today (avec icône de calendrier)
  - Calendar (sélectionné, avec fond bleu)
  - Tasks (avec icône de coche)
  - Contacts (avec icône de personne)

#### 2. Zone Centrale - Calendrier (60% de la largeur)
- **Titre du mois** : "April" en grand et en gras
- **En-têtes des jours** : Mon, Tue, Wed, Thu, Fri, Sat, Sun
- **Grille du calendrier** : 
  - Jours du mois précédent (mars) en gris clair
  - Jours d'avril en noir
  - Jours du mois suivant (mai) en gris clair
  - Date sélectionnée (14) mise en évidence avec un cercle bleu
- **Événements colorés** :
  - Team Meeting (turquoise) : 30 avril - 1er mai
  - Project Deadline (rouge) : 7 mai
  - Client Presentation (bleu) : 13 mai

#### 3. Panneau Latéral Droit - Notifications (20% de la largeur)
- **Titre "Notifications"** en gras
- **Carte de rappel** : Icône de cloche jaune + "Team Meeting in 15min"
- **Carte d'événement** : Icône d'horloge bleue + "Client Presentation"

#### 4. Éléments Supplémentaires
- **Icône de profil** : En haut à droite de l'écran
- **Arrière-plan** : Dégradé bleu clair avec effet de profondeur

### 🎨 Palette de Couleurs

```typescript
// Couleurs principales
primary: '#3b82f6'        // Bleu principal
primaryLight: '#dbeafe'    // Bleu clair pour les icônes
background: '#e0f2fe'      // Arrière-plan bleu clair
surface: '#f8fafc'         // Gris très clair pour les barres latérales
card: '#ffffff'            // Blanc pour les cartes

// Couleurs d'événements
eventRed: '#ef4444'        // Rouge pour Project Deadline
eventBlue: '#3b82f6'       // Bleu pour Client Presentation
eventCyan: '#06b6d4'       // Turquoise pour Team Meeting
eventYellow: '#f59e0b'     // Jaune pour les rappels

// Couleurs de texte
text: '#1e293b'            // Gris foncé pour le texte principal
textSecondary: '#64748b'   // Gris moyen pour le texte secondaire
textMuted: '#cbd5e1'       // Gris clair pour les jours des autres mois
```

### 🚀 Installation et Utilisation

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Lancer l'application** :
   ```bash
   npm start
   ```

3. **Ouvrir sur votre appareil** :
   - Scannez le QR code avec l'app Expo Go
   - Ou appuyez sur 'w' pour ouvrir dans le navigateur web

### 📱 Compatibilité

- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **Design responsive** qui s'adapte à différentes tailles d'écran
- **Icônes Ionicons** pour une cohérence visuelle parfaite

### 🔧 Structure des Fichiers

```
src/
├── screens/
│   └── CalendarScreen.tsx    # Écran principal avec le design
├── constants/
│   └── Colors.ts             # Palette de couleurs
└── components/                # Composants réutilisables
```

### 🎯 Fonctionnalités Implémentées

- ✅ Design exact de l'interface de référence
- ✅ Layout en 3 colonnes responsive
- ✅ Calendrier mensuel avec événements colorés
- ✅ Navigation latérale avec icônes
- ✅ Panneau de notifications
- ✅ Effets visuels neumorphic
- ✅ Palette de couleurs harmonieuse
- ✅ Typographie moderne et lisible

### 🎨 Personnalisation

Le design est entièrement personnalisable via le fichier `Colors.ts`. Vous pouvez facilement :
- Modifier les couleurs principales
- Ajuster les couleurs d'événements
- Changer les couleurs de fond et de surface
- Personnaliser la palette de texte

---

**Note** : Ce design reproduit fidèlement l'interface montrée dans l'image de référence, avec une attention particulière portée aux détails visuels, aux couleurs et à la disposition des éléments.
