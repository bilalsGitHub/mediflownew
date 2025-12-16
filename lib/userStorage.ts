// User storage helper (temporary until Supabase is connected)

export interface User {
  id: string;
  email: string;
  password: string; // Will be hashed in production
  fullName: string;
  role: 'doctor' | 'patient';
  country?: string;
  age?: number;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

const USERS_STORAGE_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export const userStorage = {
  // Get all users
  getAll(): User[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get user by id
  getById(id: string): User | null {
    const users = this.getAll();
    return users.find(u => u.id === id) || null;
  },

  // Get user by email
  getByEmail(email: string): User | null {
    const users = this.getAll();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Create new user
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const users = this.getAll();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  // Update user
  update(id: string, updates: Partial<User>): User | null {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return users[index];
  },

  // Delete user
  delete(id: string): void {
    const users = this.getAll();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
  },

  // Get current logged in user
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;
    return this.getById(userId);
  },

  // Set current logged in user
  setCurrentUser(userId: string | null): void {
    if (typeof window === 'undefined') return;
    if (userId) {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  // Login (check credentials)
  login(email: string, password: string): User | null {
    const user = this.getByEmail(email);
    if (!user || user.password !== password) {
      return null;
    }
    this.setCurrentUser(user.id);
    return user;
  },

  // Logout
  logout(): void {
    this.setCurrentUser(null);
  },

  // Initialize with test user
  initializeTestUser(): void {
    const users = this.getAll();
    const testUserExists = users.some(u => u.email === 'doctor@test.com');
    
    if (!testUserExists) {
      this.create({
        email: 'doctor@test.com',
        password: 'test123',
        fullName: 'Test Doktor',
        role: 'doctor',
        country: 'Germany',
        age: 35,
        language: 'German',
      });
    }
  },

  // Clear all (for testing)
  clear(): void {
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};

