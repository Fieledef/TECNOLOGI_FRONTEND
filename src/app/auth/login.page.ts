import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';


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

      // Llamar al método login del AuthService
      const response = await this.auth.login(email, password);

      // Guardar token y usuario
      const user = {
        user_id: response.user.user_id,
        nombre: response.user.nombre,
        email: response.user.email,
        rol: response.user.rol as any
      };

      this.auth.setUserFromLogin(user, response.access_token);

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
    } catch (error: any) {
      // Manejar errores de autenticación
      if (error.message) {
        this.notifications.error(
          'Error de autenticación',
          error.message
        );
      } else {
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
}


