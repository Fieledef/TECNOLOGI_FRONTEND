import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar.component';
import { DataService, Venta } from '../../services/data.service';

@Component({
  selector: 'app-ventas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './ventas.page.html',
  styleUrls: ['./ventas.page.css']
})
export class VentasPage {
  private data = inject(DataService);

  ventas = signal<Venta[]>(this.data.getVentas());
  busqueda = signal('');
  estadoFiltro = signal<'todos' | 'pendiente' | 'pagado' | 'anulado'>('todos');
  fechaDesde = signal('');
  fechaHasta = signal('');

  selectedVenta = signal<Venta | null>(null);

  filtered = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    const estado = this.estadoFiltro();
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();

    return this.ventas().filter(v => {
      if (estado !== 'todos' && v.estado !== estado) return false;
      if (term && !v.clienteNombre.toLowerCase().includes(term) && !v.serie.includes(term) && !v.numero.includes(term)) return false;
      if (desde && v.fecha < desde) return false;
      if (hasta && v.fecha > hasta) return false;
      return true;
    });
  });

  totalVentas = computed(() => {
    return this.filtered().reduce((sum, v) => sum + v.total, 0);
  });

  verDetalle(venta: Venta) {
    this.selectedVenta.set(venta);
  }

  cerrarDetalle() {
    this.selectedVenta.set(null);
  }
}