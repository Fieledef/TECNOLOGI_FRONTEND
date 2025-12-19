import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar.component';
import { DataService, Proveedor } from '../../services/data.service';

@Component({
  selector: 'app-proveedores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './proveedores.page.html',
  styleUrls: ['./proveedores.page.css']
})
export class ProveedoresPage {
  private data = inject(DataService);

  proveedores = signal<Proveedor[]>(this.data.getProveedores());
  busqueda = signal('');
  tipoFiltro = signal<'todos' | 'activo' | 'inactivo'>('todos');
  campoBusqueda = signal<'razonSocial' | 'documento' | 'email'>('razonSocial');

  showModal = signal(false);
  editingProveedor = signal<Proveedor | null>(null);

  formData = signal<Partial<Proveedor>>({
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    razonSocial: '',
    nombreComercial: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    estado: 'activo'
  });

  filtered = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    const tipo = this.tipoFiltro();
    const campo = this.campoBusqueda();

    return this.proveedores().filter(p => {
      if (tipo !== 'todos' && p.estado !== tipo) return false;
      if (!term) return true;

      if (campo === 'razonSocial') return p.razonSocial.toLowerCase().includes(term);
      if (campo === 'documento') return p.numeroDocumento.includes(term);
      if (campo === 'email') return (p.email || '').toLowerCase().includes(term);
      return true;
    });
  });

  openModal(proveedor?: Proveedor) {
    if (proveedor) {
      this.editingProveedor.set(proveedor);
      this.formData.set({ ...proveedor });
    } else {
      this.editingProveedor.set(null);
      this.formData.set({
        tipoDocumento: 'RUC',
        numeroDocumento: '',
        razonSocial: '',
        nombreComercial: '',
        direccion: '',
        telefono: '',
        email: '',
        contacto: '',
        estado: 'activo'
      });
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProveedor.set(null);
  }

  saveProveedor() {
    const form = this.formData();
    if (!form.razonSocial || !form.numeroDocumento) return;

    if (this.editingProveedor()) {
      this.data.updateProveedor(this.editingProveedor()!.id, form);
      this.proveedores.set(this.data.getProveedores());
    } else {
      this.data.addProveedor(form as Omit<Proveedor, 'id' | 'fechaRegistro'>);
      this.proveedores.set(this.data.getProveedores());
    }
    this.closeModal();
  }

  deleteProveedor(id: string) {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      this.data.deleteProveedor(id);
      this.proveedores.set(this.data.getProveedores());
    }
  }

  updateFormField(field: keyof Proveedor, value: any) {
    this.formData.update(d => ({ ...d, [field]: value }));
  }
}