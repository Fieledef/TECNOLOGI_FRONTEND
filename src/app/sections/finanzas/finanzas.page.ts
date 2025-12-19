import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar.component';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-finanzas-page',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './finanzas.page.html',
  styleUrls: ['./finanzas.page.css']
})
export class FinanzasPage {
  private data = inject(DataService);

  ventas = signal(this.data.getVentas());
  compras = signal(this.data.getCompras());

  totalVentas = computed(() => {
    return this.ventas().reduce((sum, v) => sum + v.total, 0);
  });

  totalCompras = computed(() => {
    return this.compras().reduce((sum, c) => sum + c.total, 0);
  });

  utilidadBruta = computed(() => {
    return this.totalVentas() - this.totalCompras();
  });

  ventasPagadas = computed(() => {
    return this.ventas().filter(v => v.estado === 'pagado').reduce((sum, v) => sum + v.total, 0);
  });

  comprasPagadas = computed(() => {
    return this.compras().filter(c => c.estado === 'pagado').reduce((sum, c) => sum + c.total, 0);
  });

  flujoCaja = computed(() => {
    return this.ventasPagadas() - this.comprasPagadas();
  });
}