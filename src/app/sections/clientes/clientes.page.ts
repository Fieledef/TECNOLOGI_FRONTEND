import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../shared/sidebar.component';
import { DataService, Cliente } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.css']
})
export class ClientesPage {
  private data = inject(DataService);
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private loading = inject(LoadingService);

  clientes = signal<Cliente[]>(this.data.getClientes());
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

    try {
      this.loading.start();

      if (this.editingCliente()) {
        this.data.updateCliente(this.editingCliente()!.id, form);
        this.clientes.set(this.data.getClientes());
        this.notifications.success(
          'Cliente actualizado',
          `El cliente "${form.nombre}" ha sido actualizado correctamente`
        );
      } else {
        this.data.addCliente(form as Omit<Cliente, 'id' | 'fechaRegistro'>);
        this.clientes.set(this.data.getClientes());
        this.notifications.success(
          'Cliente creado',
          `El cliente "${form.nombre}" ha sido creado correctamente`
        );
      }
      this.closeModal();
    } catch (error) {
      this.notifications.error(
        'Error al guardar',
        'No se pudo guardar el cliente. Por favor, intenta nuevamente.'
      );
    } finally {
      this.loading.stop();
    }
  }

  deleteCliente(id: string) {
    const cliente = this.clientes().find(c => c.id === id);
    const nombre = cliente?.nombre || 'este cliente';
    
    if (confirm(`¿Está seguro de eliminar el cliente "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        this.loading.start();
        this.data.deleteCliente(id);
        this.clientes.set(this.data.getClientes());
        this.notifications.success(
          'Cliente eliminado',
          `El cliente "${nombre}" ha sido eliminado correctamente`
        );
      } catch (error) {
        this.notifications.error(
          'Error al eliminar',
          'No se pudo eliminar el cliente. Por favor, intenta nuevamente.'
        );
      } finally {
        this.loading.stop();
      }
    }
  }

  updateFormField(field: keyof Cliente, value: any) {
    this.formData.update(d => ({ ...d, [field]: value }));
  }

  async buscarEnSunat() {
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

    try {
      this.buscandoSunat.set(true);
      this.loading.start();

      // Petición al backend - el backend se conectará con SUNAT
      const response = await this.http.get<{
        nombre?: string;
        razonSocial?: string;
        direccion?: string;
        estado?: string;
        condicion?: string;
        distrito?: string;
        provincia?: string;
        departamento?: string;
      }>(`/api/clientes/sunat/${tipoDocumento}/${numeroDocumento}`).toPromise();

      if (response) {
        // Actualizar formulario con los datos obtenidos
        this.formData.update(d => ({
          ...d,
          nombre: response.nombre || d.nombre || '',
          razonSocial: response.razonSocial || d.razonSocial || '',
          direccion: response.direccion || 
                     (response.distrito && response.provincia && response.departamento 
                       ? `${response.distrito}, ${response.provincia}, ${response.departamento}`
                       : d.direccion || '')
        }));

        this.notifications.success(
          'Datos encontrados',
          `Se encontraron los datos del ${tipoDocumento} ${numeroDocumento}`
        );
      }
    } catch (error: any) {
      if (error.status === 404) {
        this.notifications.warning(
          'No encontrado',
          `No se encontraron datos en SUNAT para el ${tipoDocumento} ${numeroDocumento}`
        );
      } else if (error.status === 400) {
        this.notifications.error(
          'Error en la búsqueda',
          error.error?.message || 'El documento ingresado no es válido'
        );
      } else {
        this.notifications.error(
          'Error al consultar SUNAT',
          error.error?.message || 'No se pudo conectar con el servicio de SUNAT. Intenta más tarde.'
        );
      }
    } finally {
      this.buscandoSunat.set(false);
      this.loading.stop();
    }
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