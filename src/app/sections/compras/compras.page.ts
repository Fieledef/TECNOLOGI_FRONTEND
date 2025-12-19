import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar.component';
import { DataService, Compra } from '../../services/data.service';

@Component({
  selector: 'app-compras-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './compras.page.html',
  styleUrls: ['./compras.page.css']
})
export class ComprasPage {
  private data = inject(DataService);

  compras = signal<Compra[]>(this.data.getCompras());
  busqueda = signal('');
  estadoFiltro = signal<'todos' | 'pendiente' | 'pagado' | 'anulado'>('todos');
  fechaDesde = signal('');
  fechaHasta = signal('');

  selectedCompra = signal<Compra | null>(null);

  filtered = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    const estado = this.estadoFiltro();
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();

    return this.compras().filter(c => {
      if (estado !== 'todos' && c.estado !== estado) return false;
      if (term && !c.proveedorNombre.toLowerCase().includes(term) && !c.serie.includes(term) && !c.numero.includes(term)) return false;
      if (desde && c.fecha < desde) return false;
      if (hasta && c.fecha > hasta) return false;
      return true;
    });
  });

  totalCompras = computed(() => {
    return this.filtered().reduce((sum, c) => sum + c.total, 0);
  });

  verDetalle(compra: Compra) {
    this.selectedCompra.set(compra);
  }

  cerrarDetalle() {
    this.selectedCompra.set(null);
  }
}