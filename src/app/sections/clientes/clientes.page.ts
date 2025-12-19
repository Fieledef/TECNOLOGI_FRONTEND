import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar.component';
import { DataService, Cliente } from '../../services/data.service';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.css']
})
export class ClientesPage {
  private data = inject(DataService);

  clientes = signal<Cliente[]>(this.data.getClientes());
  busqueda = signal('');
  tipoFiltro = signal<'todos' | 'activo' | 'inactivo'>('todos');
  campoBusqueda = signal<'nombre' | 'documento' | 'email'>('nombre');

  showModal = signal(false);
  editingCliente = signal<Cliente | null>(null);

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
    if (!form.nombre || !form.numeroDocumento) return;

    if (this.editingCliente()) {
      this.data.updateCliente(this.editingCliente()!.id, form);
      this.clientes.set(this.data.getClientes());
    } else {
      this.data.addCliente(form as Omit<Cliente, 'id' | 'fechaRegistro'>);
      this.clientes.set(this.data.getClientes());
    }
    this.closeModal();
  }

  deleteCliente(id: string) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.data.deleteCliente(id);
      this.clientes.set(this.data.getClientes());
    }
  }

  updateFormField(field: keyof Cliente, value: any) {
    this.formData.update(d => ({ ...d, [field]: value }));
  }
}