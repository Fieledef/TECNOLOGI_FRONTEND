# Sistema de Roles y Permisos

## ⚠️ IMPORTANTE: Seguridad en Backend vs Frontend

### La Seguridad Real DEBE estar en el Backend

**El frontend solo mejora la experiencia de usuario (UX), pero NO proporciona seguridad real.**

- ✅ **Frontend**: Oculta/muestra botones, mejora la UX
- ✅ **Backend**: Valida permisos en cada petición, proporciona seguridad real

---

## 📋 Roles Implementados

El sistema incluye los siguientes roles:

- **`admin`**: Administrador - Puede hacer todo (crear, modificar, eliminar)
- **`vendedor`**: Vendedor - Solo lectura y ventas
- **`almacen`**: Almacén - Puede crear productos, ver almacenes
- **`contador`**: Contador - Solo lectura de finanzas

---

## 🔧 Implementación en Frontend

### Servicio de Autenticación (`auth.service.ts`)

El servicio `AuthService` proporciona métodos para verificar permisos:

```typescript
// Verificar si es administrador
auth.isAdmin()

// Verificar si puede modificar (solo admin)
auth.canModify()

// Verificar si puede eliminar (solo admin)
auth.canDelete()

// Verificar si puede crear (admin y almacen)
auth.canCreate()
```

### Uso en Componentes

```typescript
// En el componente TypeScript
private auth = inject(AuthService);

canModify = () => this.auth.canModify();
canDelete = () => this.auth.canDelete();
canCreate = () => this.auth.canCreate();
```

```html
<!-- En el template HTML -->
<button *ngIf="canModify()" (click)="editar()">Editar</button>
<button *ngIf="canDelete()" (click)="eliminar()">Eliminar</button>
```

---

## 🔒 Lo que DEBE hacer el Backend

### 1. Validar Token JWT en cada petición

```javascript
// Ejemplo en Node.js/Express
app.use('/api/productos', authenticateToken);

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

### 2. Verificar permisos en cada endpoint

```javascript
// Endpoint para crear producto
app.post('/api/productos', authenticateToken, (req, res) => {
  // Verificar que el usuario tenga permiso
  if (req.user.rol !== 'admin' && req.user.rol !== 'almacen') {
    return res.status(403).json({ error: 'No tienes permisos para crear productos' });
  }
  
  // Proceder con la creación
  // ...
});

// Endpoint para modificar producto
app.put('/api/productos/:id', authenticateToken, (req, res) => {
  // Solo admin puede modificar
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden modificar productos' });
  }
  
  // Proceder con la modificación
  // ...
});

// Endpoint para eliminar producto
app.delete('/api/productos/:id', authenticateToken, (req, res) => {
  // Solo admin puede eliminar
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden eliminar productos' });
  }
  
  // Proceder con la eliminación
  // ...
});
```

### 3. Incluir información del usuario en el token JWT

```javascript
// Al hacer login, generar token con información del usuario
const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email, 
    rol: user.rol 
  },
  SECRET,
  { expiresIn: '24h' }
);
```

### 4. Middleware de autorización (opcional pero recomendado)

```javascript
// Middleware para verificar roles
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    
    next();
  };
}

// Uso
app.post('/api/productos', authenticateToken, authorize('admin', 'almacen'), crearProducto);
app.put('/api/productos/:id', authenticateToken, authorize('admin'), modificarProducto);
app.delete('/api/productos/:id', authenticateToken, authorize('admin'), eliminarProducto);
```

---

## 📝 Estructura de Respuestas del Backend

### Respuesta de Login

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "nombre": "Administrador",
    "email": "admin@sistema.com",
    "rol": "admin"
  }
}
```

### Respuesta de Error (403 Forbidden)

```json
{
  "error": "No tienes permisos para realizar esta acción",
  "code": "FORBIDDEN",
  "requiredRole": "admin"
}
```

---

## 🔄 Integración con el Frontend

### Actualizar AuthService para usar el backend real

```typescript
// En auth.service.ts (cuando tengas el backend)
async login(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Guardar token
      localStorage.setItem('token', data.token);
      // Guardar usuario
      this.currentUser.set(data.user);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error en login:', error);
    return false;
  }
}
```

### Interceptor HTTP para agregar token

```typescript
// http.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

---

## ✅ Checklist para el Backend

- [ ] Implementar autenticación JWT
- [ ] Validar token en cada petición protegida
- [ ] Verificar rol del usuario en cada endpoint
- [ ] Retornar error 403 cuando no tenga permisos
- [ ] Incluir información del usuario en el token
- [ ] Implementar middleware de autorización
- [ ] Documentar endpoints y permisos requeridos

---

## 🎯 Resumen

1. **Frontend**: Mejora UX ocultando/mostrando elementos según permisos
2. **Backend**: Proporciona seguridad real validando permisos en cada petición
3. **Nunca confíes solo en el frontend** - siempre valida en el backend
4. **El frontend puede ser modificado** - el backend es la única fuente de verdad

---

## 📚 Recursos Adicionales

- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io - Documentación de JSON Web Tokens](https://jwt.io/)
- [Angular - HTTP Interceptors](https://angular.dev/guide/http/interceptors)

