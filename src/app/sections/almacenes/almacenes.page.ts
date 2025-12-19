import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar.component';
import { MockDataService, Almacen } from '../../services/mock-data.service';

@Component({
  selector: 'app-almacenes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './almacenes.page.html',
  styleUrls: ['./almacenes.page.css']
})
export class AlmacenesPage {
  private data = inject(MockDataService);

  almacenes = signal<Almacen[]>(this.data.getAlmacenes());
  almacenSeleccionado = signal<string | null>(null);
  busqueda = signal('');
  Math = Math;

  constructor() {
    // Seleccionar el primer almacén por defecto
    if (this.almacenes().length > 0) {
      this.almacenSeleccionado.set(this.almacenes()[0].id);
    }
  }

  getProductosEnAlmacen(almacenId: string) {
    return this.data.getProductosEnAlmacen(almacenId);
  }

  seleccionarAlmacen(almacenId: string) {
    this.almacenSeleccionado.set(almacenId);
  }

  productosDelAlmacenSeleccionado = computed(() => {
    const almacenId = this.almacenSeleccionado();
    if (!almacenId) return [];
    const productos = this.getProductosEnAlmacen(almacenId);
    
    // Filtrar por búsqueda si existe
    const term = this.busqueda().trim().toLowerCase();
    if (!term) return productos;
    
    return productos.filter(p => 
      p.nombre?.toLowerCase().includes(term) || 
      p.codigoInterno?.toLowerCase().includes(term)
    );
  });

  nombreAlmacenSeleccionado = computed(() => {
    const almacenId = this.almacenSeleccionado();
    if (!almacenId) return '';
    const almacen = this.almacenes().find(a => a.id === almacenId);
    return almacen?.nombre || '';
  });

  codigoAlmacenSeleccionado = computed(() => {
    const almacenId = this.almacenSeleccionado();
    if (!almacenId) return '';
    const almacen = this.almacenes().find(a => a.id === almacenId);
    return almacen?.codigo || '';
  });

  getAlmacenesDeProducto(productoId: string) {
    return this.data.getAlmacenesDeProducto(productoId);
  }

  getTotalProductos() {
    return this.productosDelAlmacenSeleccionado().length;
  }

  getTotalStock() {
    return this.productosDelAlmacenSeleccionado().reduce((sum, p) => sum + (p.stockEnAlmacen || 0), 0);
  }
}

