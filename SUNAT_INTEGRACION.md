# 🔍 Integración con API de SUNAT - Documentación

## ✅ Funcionalidad Implementada

### Búsqueda Automática de Datos por DNI/RUC
- ✅ Botón "Buscar SUNAT" junto al campo de documento
- ✅ Validación de formato de DNI (8 dígitos) y RUC (11 dígitos)
- ✅ Validación automática mientras se escribe (solo números)
- ✅ Estado de carga durante la búsqueda
- ✅ Relleno automático de campos con datos obtenidos
- ✅ Manejo de errores y notificaciones

---

## 🔌 Endpoint Requerido en el Backend

### GET `/api/clientes/sunat/{tipoDocumento}/{numeroDocumento}`

**Ejemplo:**
- DNI: `GET /api/clientes/sunat/DNI/12345678`
- RUC: `GET /api/clientes/sunat/RUC/20123456789`

#### Response Exitosa (200)

```json
{
  "nombre": "Juan Pérez García",
  "razonSocial": null,
  "direccion": "Av. Principal 123",
  "distrito": "San Isidro",
  "provincia": "Lima",
  "departamento": "Lima",
  "estado": "HABIDO",
  "condicion": "ACTIVO"
}
```

**Para RUC:**
```json
{
  "nombre": null,
  "razonSocial": "EMPRESA S.A.C.",
  "direccion": "Av. Industrial 456",
  "distrito": "La Victoria",
  "provincia": "Lima",
  "departamento": "Lima",
  "estado": "HABIDO",
  "condicion": "ACTIVO"
}
```

#### Response Error (404)
```json
{
  "message": "No se encontraron datos en SUNAT para el documento especificado"
}
```

#### Response Error (400)
```json
{
  "message": "El documento ingresado no es válido"
}
```

#### Response Error (500)
```json
{
  "message": "Error al conectar con el servicio de SUNAT"
}
```

---

## 📋 Campos que se Rellenan Automáticamente

### Para DNI:
- ✅ **nombre** - Nombre completo de la persona
- ✅ **direccion** - Dirección completa (distrito, provincia, departamento)

### Para RUC:
- ✅ **razonSocial** - Razón social de la empresa
- ✅ **direccion** - Dirección completa (distrito, provincia, departamento)

---

## 🎯 Flujo de Uso

1. Usuario selecciona tipo de documento (DNI o RUC)
2. Usuario ingresa el número de documento
3. Aparece el botón "🔍 Buscar SUNAT"
4. Usuario hace clic en el botón
5. Se muestra estado de carga
6. Backend consulta SUNAT
7. Si encuentra datos:
   - Se rellenan automáticamente los campos
   - Se muestra notificación de éxito
8. Si no encuentra:
   - Se muestra notificación de advertencia
   - El usuario puede completar manualmente

---

## 🔧 Implementación en el Backend

### Ejemplo en Node.js/Express

```javascript
const axios = require('axios');

app.get('/api/clientes/sunat/:tipo/:numero', async (req, res) => {
  const { tipo, numero } = req.params;

  // Validar formato
  if (tipo === 'DNI' && !/^\d{8}$/.test(numero)) {
    return res.status(400).json({
      message: 'El DNI debe tener 8 dígitos'
    });
  }

  if (tipo === 'RUC' && !/^\d{11}$/.test(numero)) {
    return res.status(400).json({
      message: 'El RUC debe tener 11 dígitos'
    });
  }

  try {
    // Consultar API de SUNAT
    // Nota: SUNAT tiene diferentes endpoints para DNI y RUC
    let sunatResponse;
    
    if (tipo === 'DNI') {
      // Endpoint para consultar DNI en SUNAT
      sunatResponse = await axios.get(
        `https://api.sunat.gob.pe/v1/contribuyente/contribuyentes/${numero}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SUNAT_API_TOKEN}`
          }
        }
      );
    } else if (tipo === 'RUC') {
      // Endpoint para consultar RUC en SUNAT
      sunatResponse = await axios.get(
        `https://api.sunat.gob.pe/v1/contribuyente/contribuyentes/${numero}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SUNAT_API_TOKEN}`
          }
        }
      );
    }

    // Procesar respuesta de SUNAT y formatear
    const datos = sunatResponse.data;
    
    res.json({
      nombre: tipo === 'DNI' ? datos.nombres : null,
      razonSocial: tipo === 'RUC' ? datos.razonSocial : null,
      direccion: datos.direccion || null,
      distrito: datos.distrito || null,
      provincia: datos.provincia || null,
      departamento: datos.departamento || null,
      estado: datos.estado || null,
      condicion: datos.condicion || null
    });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        message: `No se encontraron datos en SUNAT para el ${tipo} ${numero}`
      });
    }

    console.error('Error al consultar SUNAT:', error);
    res.status(500).json({
      message: 'Error al conectar con el servicio de SUNAT'
    });
  }
});
```

---

## 📝 Notas Importantes

### APIs de SUNAT Disponibles

SUNAT ofrece diferentes APIs:

1. **API de Consulta RUC** (gratuita)
   - Endpoint: `https://api.sunat.gob.pe/v1/contribuyente/contribuyentes/{ruc}`
   - Requiere token de autenticación

2. **API de Consulta DNI** (puede requerir suscripción)
   - Verificar documentación oficial de SUNAT

3. **Alternativas:**
   - Usar servicios de terceros que consultan SUNAT
   - Implementar web scraping (no recomendado)
   - Usar librerías como `peru-consult` para Node.js

### Consideraciones

1. **Rate Limiting**: SUNAT puede tener límites de consultas por minuto
2. **Caché**: Considerar cachear resultados para evitar consultas repetidas
3. **Timeout**: Configurar timeout adecuado (SUNAT puede ser lento)
4. **Manejo de Errores**: SUNAT puede estar temporalmente no disponible

---

## 🎨 Características del Frontend

### Validaciones
- ✅ Solo permite números en el campo de documento
- ✅ Limita a 8 dígitos para DNI
- ✅ Limita a 11 dígitos para RUC
- ✅ Valida formato antes de buscar

### UX
- ✅ Botón solo aparece cuando hay documento ingresado
- ✅ Botón solo aparece para DNI y RUC
- ✅ Estado de carga durante búsqueda
- ✅ Botón deshabilitado mientras busca
- ✅ Notificaciones informativas
- ✅ Hint text explicativo

### Manejo de Errores
- ✅ 404: No encontrado en SUNAT
- ✅ 400: Documento inválido
- ✅ 500: Error del servidor
- ✅ 0: Error de conexión

---

## 📚 Estructura de Datos Esperada

### Interface de Respuesta

```typescript
interface SunatResponse {
  nombre?: string;           // Para DNI
  razonSocial?: string;      // Para RUC
  direccion?: string;        // Dirección completa
  distrito?: string;
  provincia?: string;
  departamento?: string;
  estado?: string;           // HABIDO / NO HABIDO
  condicion?: string;       // ACTIVO / INACTIVO
}
```

---

## ✅ Checklist para Backend

- [ ] Endpoint `GET /api/clientes/sunat/:tipo/:numero` implementado
- [ ] Validación de formato de DNI (8 dígitos)
- [ ] Validación de formato de RUC (11 dígitos)
- [ ] Integración con API de SUNAT
- [ ] Manejo de errores (404, 400, 500)
- [ ] Formateo de respuesta según estructura esperada
- [ ] Manejo de timeout
- [ ] Considerar implementar caché
- [ ] Logging de consultas

---

## 🚀 Próximos Pasos (Opcional)

1. **Caché de Consultas**
   - Guardar resultados en base de datos
   - Evitar consultas repetidas a SUNAT

2. **Búsqueda en Lote**
   - Permitir buscar múltiples documentos a la vez

3. **Historial de Consultas**
   - Guardar historial de búsquedas realizadas

4. **Validación de Estado**
   - Mostrar si el contribuyente está HABIDO o NO HABIDO
   - Mostrar condición (ACTIVO/INACTIVO)

---

## 💡 Tips

1. **Usar servicios de terceros** si la API oficial de SUNAT es complicada
2. **Implementar caché** para mejorar rendimiento
3. **Manejar timeouts** adecuadamente (SUNAT puede ser lento)
4. **Validar datos** antes de guardar en base de datos
5. **Logging** de todas las consultas para debugging

---

## 📖 Recursos

- [SUNAT - Consulta RUC](https://www.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias)
- [API SUNAT (si está disponible)](https://www.sunat.gob.pe/)
- Librerías Node.js: `peru-consult`, `sunat-consult`

---

## 🎯 Estado Actual

✅ **Frontend completamente listo:**
- Botón de búsqueda ✅
- Validaciones ✅
- Manejo de estados ✅
- Relleno automático ✅
- Notificaciones ✅

⏳ **Pendiente de backend:**
- Endpoint de consulta SUNAT
- Integración con API de SUNAT
- Formateo de respuesta

