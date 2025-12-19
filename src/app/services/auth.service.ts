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
    // Por defecto, simular un usuario administrador
    // En producción, esto se obtendría del token JWT o sesión
    this.currentUser.set({
      id: '1',
      nombre: 'Administrador',
      email: 'admin@sistema.com',
      rol: 'admin'
    });
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

  // Simular login (en producción esto haría una petición al backend)
  login(email: string, password: string, rol: UserRole = 'admin'): boolean {
    // Aquí normalmente harías una petición al backend
    // Por ahora simulamos el login
    this.currentUser.set({
      id: '1',
      nombre: email.split('@')[0],
      email,
      rol
    });
    return true;
  }

  // Cerrar sesión
  logout() {
    this.currentUser.set(null);
  }
}

