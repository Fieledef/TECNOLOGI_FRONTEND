import { Injectable, signal } from '@angular/core';

export type UserRole = 'admin' | 'vendedor' | 'almacen' | 'contador';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Simulación de usuario actual (en producción esto vendría del backend)
  private currentUser = signal<User | null>(null);

  constructor() {
    // Intentar cargar usuario desde localStorage o token
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
      } catch (e) {
        // Si hay error, limpiar
        this.clearStorage();
      }
    }
  }

  private clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.currentUser();
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(role: UserRole): boolean {
    const user = this.currentUser();
    return user?.rol === role;
  }

  // Verificar si el usuario tiene alguno de los roles especificados
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.includes(user.rol);
  }

  // Verificar si es administrador
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Verificar si puede modificar (solo admin)
  canModify(): boolean {
    return this.isAdmin();
  }

  // Verificar si puede eliminar (solo admin)
  canDelete(): boolean {
    return this.isAdmin();
  }

  // Verificar si puede crear (admin y algunos roles específicos)
  canCreate(): boolean {
    return this.hasAnyRole(['admin', 'almacen']);
  }

  // Simular cambio de usuario (para testing)
  setUser(user: User | null) {
    this.currentUser.set(user);
  }

  // Cerrar sesión
  logout() {
    this.clearStorage();
    this.currentUser.set(null);
  }

  // Guardar usuario (llamado después de login exitoso)
  setUserFromLogin(user: User, token: string) {
    this.currentUser.set(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
}

