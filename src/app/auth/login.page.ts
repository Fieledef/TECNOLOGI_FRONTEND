import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private loading = inject(LoadingService);
  private http = inject(HttpClient);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  rememberMe = signal(false);

  async login() {
    const email = this.email().trim();
    const password = this.password();

    // Validaciones
    if (!email) {
      this.notifications.error('Email requerido', 'Por favor, ingresa tu email');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.notifications.error('Email inválido', 'Por favor, ingresa un email válido');
      return;
    }

    if (!password) {
      this.notifications.error('Contraseña requerida', 'Por favor, ingresa tu contraseña');
      return;
    }

    try {
      this.loading.start();

      // Petición al backend
      const response = await this.http.post<{
        token: string;
        user: {
          id: string;
          nombre: string;
          email: string;
          rol: string;
        };
      }>('/api/auth/login', {
        email,
        password
      }).toPromise();

      if (response) {
        // Guardar token y usuario
        const user = {
          id: response.user.id,
          nombre: response.user.nombre,
          email: response.user.email,
          rol: response.user.rol as any
        };
        
        this.auth.setUserFromLogin(user, response.token);
        
        // Si rememberMe está activado, guardar también
        if (this.rememberMe()) {
          localStorage.setItem('rememberMe', 'true');
        }

        this.notifications.success(
          'Bienvenido',
          `Hola ${response.user.nombre}`
        );

        // Redirigir a la página principal
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      // El interceptor ya maneja los errores HTTP, pero podemos agregar un mensaje específico
      if (error.status === 401) {
        this.notifications.error(
          'Credenciales incorrectas',
          'El email o contraseña son incorrectos'
        );
      } else if (!error.status) {
        // Error de red
        this.notifications.error(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión.'
        );
      }
    } finally {
      this.loading.stop();
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Para desarrollo: login rápido (eliminar en producción)
  quickLogin(rol: 'admin' | 'vendedor' | 'almacen' | 'contador' = 'admin') {
    this.email.set(`${rol}@sistema.com`);
    this.password.set('password123');
  }
}

