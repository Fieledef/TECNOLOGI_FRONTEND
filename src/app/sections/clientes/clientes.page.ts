import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar.component';
import { Cliente } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.css']
})
export class ClientesPage implements OnInit {
  private clientesService = inject(ClientesService);
  private notifications = inject(NotificationService);
  private loading = inject(LoadingService);

  clientes = signal<Cliente[]>([]);
  busqueda = signal('');
  tipoFiltro = signal<'todos' | 'activo' | 'inactivo'>('todos');
  campoBusqueda = signal<'nombre' | 'documento' | 'email'>('nombre');

  showModal = signal(false);
  editingCliente = signal<Cliente | null>(null);
  buscandoSunat = signal(false);

  formData = signal<Partial<Cliente>>({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombre: '',
    razonSocial: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 'activo'
  });

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.loading.start();
    this.clientesService.findAll().subscribe({
      next: (data) => {
        // Mapear datos del backend (snake_case) al frontend (camelCase)
        const response = data as any;
        const backendData = response.data || [];
        console.log('Backend Data:', backendData);

        const mappedData = backendData.map((cliente: any) => ({
          id: cliente.cliente_id,
          tipoDocumento: cliente.tipo_documento,
          numeroDocumento: cliente.numero_documento?.toString(),
          nombre: cliente.nombre,
          razonSocial: cliente.razon_social,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
          email: cliente.email,
          estado: cliente.estado === 1 || cliente.estado === '1' ? 'activo' : 'inactivo',
          fechaRegistro: cliente.created_at
        }));
        this.clientes.set(mappedData);
        this.loading.stop();
      },
      error: (err) => {
        console.error('Error cargando clientes', err);
        this.notifications.error('Error', 'No se pudieron cargar los clientes');
        this.loading.stop();
      }
    });
  }

  filtered = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    const tipo = this.tipoFiltro();
    const campo = this.campoBusqueda();

    return this.clientes().filter(c => {
      if (tipo !== 'todos' && c.estado !== tipo) return false;
      if (!term) return true;

      if (campo === 'nombre') return c.nombre.toLowerCase().includes(term);
      if (campo === 'documento') return c.numeroDocumento.includes(term);
      if (campo === 'email') return (c.email || '').toLowerCase().includes(term);
      return true;
    });
  });

  openModal(cliente?: Cliente) {
    if (cliente) {
      this.editingCliente.set(cliente);
      this.formData.set({ ...cliente });
    } else {
      this.editingCliente.set(null);
      this.formData.set({
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        nombre: '',
        razonSocial: '',
        direccion: '',
        telefono: '',
        email: '',
        estado: 'activo'
      });
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCliente.set(null);
  }

  saveCliente() {
    const form = this.formData();

    // Validaciones mejoradas
    if (!form.numeroDocumento?.trim()) {
      this.notifications.error('Documento requerido', 'El número de documento es obligatorio');
      return;
    }

    if (!form.nombre?.trim()) {
      this.notifications.error('Nombre requerido', 'El nombre es obligatorio');
      return;
    }

    this.loading.start();

    // Mapear datos del frontend (camelCase) al backend (snake_case)
    const dataToSend = {
      tipo_documento: form.tipoDocumento,
      numero_documento: form.numeroDocumento, // Enviar como string
      nombre: form.nombre,
      razon_social: form.razonSocial || undefined,
      direccion: form.direccion || undefined,
      telefono: form.telefono || undefined,
      email: form.email || undefined,
      estado: form.estado === 'activo' ? 1 : 0
    };

    if (this.editingCliente()) {
      this.clientesService.update(this.editingCliente()!.id, dataToSend).subscribe({
        next: () => {
          this.loadClientes();
          this.notifications.success(
            'Cliente actualizado',
            `El cliente "${form.nombre}" ha sido actualizado correctamente`
          );
          this.closeModal();
        },
        error: (err) => {
          console.error('Error actualizando cliente', err);
          this.notifications.error('Error al guardar', 'No se pudo actualizar el cliente.');
          this.loading.stop();
        },
        complete: () => this.loading.stop()
      });
    } else {
      this.clientesService.create(dataToSend).subscribe({
        next: () => {
          this.loadClientes();
          this.notifications.success(
            'Cliente creado',
            `El cliente "${form.nombre}" ha sido creado correctamente`
          );
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creando cliente', err);
          this.notifications.error('Error al guardar', 'No se pudo crear el cliente.');
          this.loading.stop();
        },
        complete: () => this.loading.stop()
      });
    }
  }

  deleteCliente(id: string) {
    const cliente = this.clientes().find(c => c.id === id);
    const nombre = cliente?.nombre || 'este cliente';

    if (confirm(`¿Está seguro de eliminar el cliente "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      this.loading.start();
      this.clientesService.remove(id).subscribe({
        next: () => {
          this.loadClientes();
          this.notifications.success(
            'Cliente eliminado',
            `El cliente "${nombre}" ha sido eliminado correctamente`
          );
        },
        error: (err) => {
          console.error('Error eliminando cliente', err);
          this.notifications.error('Error al eliminar', 'No se pudo eliminar el cliente.');
          this.loading.stop();
        },
        complete: () => this.loading.stop()
      });
    }
  }

  updateFormField(field: keyof Cliente, value: any) {
    this.formData.update(d => ({ ...d, [field]: value }));
  }

  buscarEnSunat() {
    const tipoDocumento = this.formData().tipoDocumento;
    const numeroDocumento = this.formData().numeroDocumento?.trim();

    // Validaciones
    if (!numeroDocumento) {
      this.notifications.warning(
        'DNI requerido',
        'Por favor, ingresa el número de documento antes de buscar'
      );
      return;
    }

    // Solo permitir DNI y RUC para búsqueda SUNAT
    if (tipoDocumento !== 'DNI' && tipoDocumento !== 'RUC') {
      this.notifications.warning(
        'Tipo de documento no válido',
        'La búsqueda en SUNAT solo está disponible para DNI y RUC'
      );
      return;
    }

    // Validar formato de DNI (8 dígitos) o RUC (11 dígitos)
    if (tipoDocumento === 'DNI' && !/^\d{8}$/.test(numeroDocumento)) {
      this.notifications.warning(
        'DNI inválido',
        'El DNI debe tener 8 dígitos'
      );
      return;
    }

    if (tipoDocumento === 'RUC' && !/^\d{11}$/.test(numeroDocumento)) {
      this.notifications.warning(
        'RUC inválido',
        'El RUC debe tener 11 dígitos'
      );
      return;
    }

    this.buscandoSunat.set(true);
    this.loading.start();

    this.clientesService.consultarSunat(tipoDocumento, numeroDocumento).subscribe({
      next: (response) => {
        if (response && response.success) {
          const data = response.data;

          if (tipoDocumento === 'DNI') {
            const nombreCompleto = data.nombre_completo || `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`;
            this.formData.update(d => ({
              ...d,
              nombre: nombreCompleto,
            }));
          } else if (tipoDocumento === 'RUC') {
            this.formData.update(d => ({
              ...d,
              nombre: data.nombre_o_razon_social,
              razonSocial: data.nombre_o_razon_social,
              direccion: data.direccion_completa,
              estado: data.estado === 'ACTIVO' ? 'activo' : 'inactivo',
            }));
          }

          this.notifications.success(
            'Datos encontrados',
            `Se encontraron los datos del ${tipoDocumento} ${numeroDocumento}`
          );
        } else {
          this.notifications.warning('No encontrado', 'No se encontraron datos válidos.');
        }
        this.buscandoSunat.set(false);
        this.loading.stop();
      },
      error: (error) => {
        console.error('Error buscando en SUNAT:', error);
        if (error.status === 404) {
          this.notifications.warning(
            'No encontrado',
            `No se encontraron datos en SUNAT para el ${tipoDocumento} ${numeroDocumento}`
          );
        } else {
          this.notifications.error(
            'Error al consultar SUNAT',
            error.error?.message || 'No se pudo conectar con el servicio de SUNAT.'
          );
        }
        this.buscandoSunat.set(false);
        this.loading.stop();
      }
    });
  }

  // Validar DNI mientras se escribe
  validarDNI() {
    const numeroDocumento = this.formData().numeroDocumento?.trim() || '';
    const tipoDocumento = this.formData().tipoDocumento;

    if (tipoDocumento === 'DNI' && numeroDocumento.length > 0) {
      // Solo permitir números y máximo 8 dígitos
      const soloNumeros = numeroDocumento.replace(/\D/g, '');
      if (soloNumeros.length <= 8) {
        this.updateFormField('numeroDocumento', soloNumeros);
      }
    } else if (tipoDocumento === 'RUC' && numeroDocumento.length > 0) {
      // Solo permitir números y máximo 11 dígitos
      const soloNumeros = numeroDocumento.replace(/\D/g, '');
      if (soloNumeros.length <= 11) {
        this.updateFormField('numeroDocumento', soloNumeros);
      }
    }
  }
}