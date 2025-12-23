import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const loadingService = inject(LoadingService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Agregar token si existe
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Agregar headers comunes
  req = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Iniciar loading (solo para peticiones que no sean GET rápidas)
  const shouldShowLoading = req.method !== 'GET' || req.url.includes('search');
  if (shouldShowLoading) {
    loadingService.start();
  }

  return next(req).pipe(
    finalize(() => {
      // Detener loading cuando la petición termine (éxito o error)
      if (shouldShowLoading) {
        loadingService.stop();
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Manejar diferentes tipos de errores
      if (error.status === 401) {
        // No autenticado - solo redirigir si no estamos ya en login
        if (!router.url.includes('/login')) {
          authService.logout();
          notificationService.error(
            'Sesión expirada',
            'Por favor, inicia sesión nuevamente'
          );
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      } else if (error.status === 403) {
        // Sin permisos
        notificationService.error(
          'Acceso denegado',
          error.error?.message || 'No tienes permisos para realizar esta acción'
        );
      } else if (error.status === 404) {
        // No encontrado
        notificationService.warning(
          'No encontrado',
          error.error?.message || 'El recurso solicitado no existe'
        );
      } else if (error.status === 422) {
        // Error de validación
        const errors = error.error?.errors || {};
        const firstError = Object.values(errors)[0];
        notificationService.error(
          'Error de validación',
          Array.isArray(firstError) ? firstError[0] : (firstError as string) || 'Por favor, verifica los datos ingresados'
        );
      } else if (error.status >= 500) {
        // Error del servidor
        notificationService.error(
          'Error del servidor',
          error.error?.message || 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.'
        );
      } else if (error.status === 0) {
        // Error de red
        notificationService.error(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
        );
      } else {
        // Otros errores
        notificationService.error(
          'Error',
          error.error?.message || error.message || 'Ha ocurrido un error inesperado'
        );
      }

      return throwError(() => error);
    })
  );
};
