import { LoginCredentials, RegisterCredentials, User } from '../types';

// Simulation d'une base de données d'utilisateurs
const mockUsers: User[] = [
  {
    id: '1',
    name: 'User',
    email: 'user@syncalendar.com',
    avatar: undefined,
  },
];

// Simulation d'un stockage de mots de passe (en production, utilisez des hashs)
const userPasswords: Record<string, string> = {
  'user@syncalendar.com': 'user123',
};

export class AuthService {
  private static currentUser: User | null = null;

  static async login(credentials: LoginCredentials): Promise<User> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Vérifier si l'utilisateur existe
    const existingUser = mockUsers.find(u => u.email === credentials.email);
    if (!existingUser) {
      throw new Error('Aucun compte trouvé avec cet email');
    }

    // Vérifier le mot de passe
    const storedPassword = userPasswords[credentials.email];
    if (storedPassword !== credentials.password) {
      throw new Error('Mot de passe incorrect');
    }

    this.currentUser = existingUser;
    return existingUser;
  }

  static async register(credentials: RegisterCredentials): Promise<User> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Vérifier si l'utilisateur existe déjà
    const existingUser = mockUsers.find(u => u.email === credentials.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Créer un nouvel utilisateur
    const newUser: User = {
      id: Date.now().toString(),
      name: credentials.name,
      email: credentials.email,
      avatar: undefined,
    };

    mockUsers.push(newUser);
    userPasswords[credentials.email] = credentials.password;
    this.currentUser = newUser;
    return newUser;
  }

  static async logout(): Promise<void> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = null;
  }

  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Méthode pour simuler une session persistante
  static async checkAuthStatus(): Promise<User | null> {
    // En production, vous vérifieriez un token stocké
    return this.currentUser;
  }

  // Méthode pour réinitialiser les données de test
  static resetMockData(): void {
    this.currentUser = null;
    // Garder l'utilisateur par défaut
    if (mockUsers.length === 0) {
      mockUsers.push({
        id: '1',
        name: 'User',
        email: 'user@syncalendar.com',
        avatar: undefined,
      });
      userPasswords['user@syncalendar.com'] = 'user123';
    }
  }
} 