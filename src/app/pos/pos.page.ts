import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService, Product } from '../services/mock-data.service';
import { DataService } from '../services/data.service';
import { SidebarComponent } from '../shared/sidebar.component';

interface PosItem {
  id: string;
  codigoInterno: string;
  unidad: string;
  cantidad: number;
  valorUnitario: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  igv: number;
  total: number;
  nombre: string;
  tieneIGV: boolean;
}

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './pos.page.html',
  styleUrls: ['./pos.page.css']
})
export class PosPage {
  private data = inject(MockDataService);
  private dataService = inject(DataService);

  empresa = signal('Mi Empresa S.A.C.');
  ruc = signal('20123456789');
  direccion = signal('Av. Principal 123, Lima, Perú');
  telefono = signal('+51 987 654 321');
  email = signal('ventas@miempresa.com');
  fechaEmision = signal<string>(new Date().toISOString().slice(0, 10));
  fechaVencimiento = signal<string>(new Date().toISOString().slice(0, 10));

  serie = signal('F001');
  numero = signal('000001');
  tipoComprobante = signal<'Boleta' | 'Factura'>('Factura');
  tipoOperacion = signal<'Venta' | 'Servicio' | 'Nota'>('Venta');
  moneda = signal<'PEN' | 'USD'>('PEN');
  tipoCambio = signal(3.80);
  cliente = signal('');
  clienteDocumento = signal('');
  clienteDireccion = signal('');
  formaPago = signal<'Contado' | 'Credito'>('Contado');
  observaciones = signal('');

  productos = signal<Product[]>(this.data.getProductos());
  clientes = signal(this.dataService.getClientes());
  term = signal('');
  termCliente = signal('');
  tipoDocCliente = signal('');
  selectedCliente = signal<any>(null);

  clientesFiltrados = computed(() => {
    const term = this.termCliente().trim().toLowerCase();
    const tipo = this.tipoDocCliente();
    if (!term && !tipo) return [];
    
    return this.clientes().filter(c => {
      if (tipo && c.tipoDocumento !== tipo) return false;
      if (!term) return true;
      return c.nombre.toLowerCase().includes(term) || 
             c.numeroDocumento.includes(term) ||
             (c.email || '').toLowerCase().includes(term);
    }).slice(0, 10);
  });

  filtered = computed(() => {
    const t = this.term().trim().toLowerCase();
    if (!t) return this.productos();
    return this.productos().filter(p =>
      p.nombre.toLowerCase().includes(t) || p.codigoInterno.toLowerCase().includes(t)
    );
  });

  items = signal<PosItem[]>([]);
  
  subtotal = computed(() => this.items().reduce((acc, it) => acc + it.subtotal, 0));
  descuentoGlobal = signal(0);
  totalDescuentos = computed(() => {
    const itemsDesc = this.items().reduce((acc, it) => acc + it.descuento, 0);
    return itemsDesc + this.descuentoGlobal();
  });
  baseImponible = computed(() => this.subtotal() - this.totalDescuentos());
  igv = computed(() => {
    const itemsConIGV = this.items().filter(it => it.tieneIGV);
    return itemsConIGV.reduce((acc, it) => acc + it.igv, 0);
  });
  totalPago = computed(() => this.baseImponible() + this.igv());
  totalPendiente = computed(() => this.totalPago());

  liveMessage = signal('');

  constructor() {
    effect(() => {
      const total = this.totalPago().toFixed(2);
      this.announce(`Total actualizado: S/ ${total}`);
    });
  }

  announce(msg: string) {
    this.liveMessage.set(msg);
  }

  selectCliente(cliente: any) {
    this.selectedCliente.set(cliente);
    this.cliente.set(cliente.nombre);
    this.clienteDocumento.set(`${cliente.tipoDocumento}: ${cliente.numeroDocumento}`);
    this.clienteDireccion.set(cliente.direccion || '');
  }

  onSelectProduct(code: string) {
    const p = this.productos().find(x => x.codigoInterno === code);
    if (p) this.addItemFromProduct(p);
  }

  addItemFromProduct(p: Product) {
    const precio = p.tieneIGV ? p.precio2 : p.precio1;
    const valorUnit = p.tieneIGV ? +(precio / 1.18).toFixed(2) : precio;
    const igvItem = p.tieneIGV ? +(precio - valorUnit).toFixed(2) : 0;
    
    const item: PosItem = {
      id: crypto.randomUUID(),
      codigoInterno: p.codigoInterno,
      unidad: p.unidad,
      cantidad: 1,
      valorUnitario: valorUnit,
      precioUnitario: precio,
      descuento: 0,
      subtotal: +precio.toFixed(2),
      igv: igvItem,
      total: +precio.toFixed(2),
      nombre: p.nombre,
      tieneIGV: p.tieneIGV
    };
    this.items.update(arr => [...arr, item]);
    this.announce(`Se agregó ${p.nombre}`);
  }

  removeItem(id: string) {
    const it = this.items().find(x => x.id === id);
    this.items.update(arr => arr.filter(x => x.id !== id));
    if (it) this.announce(`Se eliminó ${it.nombre}`);
  }

  updateCantidad(id: string, cantidad: number) {
    if (cantidad <= 0 || isNaN(cantidad)) cantidad = 1;
    this.items.update(arr =>
      arr.map(it => {
        if (it.id === id) {
          const subtotal = it.precioUnitario * cantidad;
          const desc = subtotal * (it.descuento / (it.subtotal || 1));
          const nuevoSubtotal = subtotal - desc;
          const nuevoIGV = it.tieneIGV ? +(nuevoSubtotal * 0.18).toFixed(2) : 0;
          return {
            ...it,
            cantidad,
            subtotal: +subtotal.toFixed(2),
            descuento: +desc.toFixed(2),
            igv: nuevoIGV,
            total: +(nuevoSubtotal + nuevoIGV).toFixed(2)
          };
        }
        return it;
      })
    );
  }

  updateDescuento(id: string, descuento: number) {
    if (descuento < 0 || isNaN(descuento)) descuento = 0;
    this.items.update(arr =>
      arr.map(it => {
        if (it.id === id) {
          const subtotal = it.precioUnitario * it.cantidad;
          const desc = subtotal * (descuento / 100);
          const nuevoSubtotal = subtotal - desc;
          const nuevoIGV = it.tieneIGV ? +(nuevoSubtotal * 0.18).toFixed(2) : 0;
          return {
            ...it,
            descuento: +desc.toFixed(2),
            subtotal: +subtotal.toFixed(2),
            igv: nuevoIGV,
            total: +(nuevoSubtotal + nuevoIGV).toFixed(2)
          };
        }
        return it;
      })
    );
  }

  updateValorUnitario(id: string, valor: number) {
    if (valor <= 0 || isNaN(valor)) valor = 0.01;
    this.items.update(arr =>
      arr.map(it => {
        if (it.id === id) {
          const precio = it.tieneIGV ? +(valor * 1.18).toFixed(2) : valor;
          const subtotal = precio * it.cantidad;
          const desc = subtotal * (it.descuento / (it.subtotal || 1));
          const nuevoSubtotal = subtotal - desc;
          const nuevoIGV = it.tieneIGV ? +(nuevoSubtotal * 0.18).toFixed(2) : 0;
          return {
            ...it,
            valorUnitario: +valor.toFixed(2),
            precioUnitario: +precio.toFixed(2),
            subtotal: +subtotal.toFixed(2),
            descuento: +desc.toFixed(2),
            igv: nuevoIGV,
            total: +(nuevoSubtotal + nuevoIGV).toFixed(2)
          };
        }
        return it;
      })
    );
  }

  updatePrecioUnitario(id: string, precio: number) {
    if (precio <= 0 || isNaN(precio)) precio = 0.01;
    this.items.update(arr =>
      arr.map(it => {
        if (it.id === id) {
          const valor = it.tieneIGV ? +(precio / 1.18).toFixed(2) : precio;
          const subtotal = precio * it.cantidad;
          const desc = subtotal * (it.descuento / (it.subtotal || 1));
          const nuevoSubtotal = subtotal - desc;
          const nuevoIGV = it.tieneIGV ? +(nuevoSubtotal * 0.18).toFixed(2) : 0;
          return {
            ...it,
            precioUnitario: +precio.toFixed(2),
            valorUnitario: +valor.toFixed(2),
            subtotal: +subtotal.toFixed(2),
            descuento: +desc.toFixed(2),
            igv: nuevoIGV,
            total: +(nuevoSubtotal + nuevoIGV).toFixed(2)
          };
        }
        return it;
      })
    );
  }

  guardarVenta() {
    if (this.items().length === 0) {
      alert('Debe agregar al menos un ítem a la venta');
      return;
    }
    if (!this.cliente().trim()) {
      alert('Debe seleccionar o ingresar un cliente');
      return;
    }
    
    const venta = {
      serie: this.serie(),
      numero: this.numero(),
      fecha: this.fechaEmision(),
      clienteId: this.selectedCliente()?.id || '',
      clienteNombre: this.cliente(),
      tipoComprobante: this.tipoComprobante(),
      moneda: this.moneda(),
      subtotal: this.subtotal(),
      igv: this.igv(),
      total: this.totalPago(),
      estado: 'pendiente' as const,
      items: this.items().map(it => ({
        productoId: it.codigoInterno,
        productoNombre: it.nombre,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: it.total
      }))
    };
    
    this.dataService.addVenta(venta);
    alert(`Venta ${this.serie()}-${this.numero()} guardada correctamente`);
    this.nuevaVenta();
  }

  imprimir() {
    window.print();
  }

  nuevaVenta() {
    if (this.items().length > 0 && !confirm('¿Desea crear una nueva venta? Se perderán los datos no guardados.')) {
      return;
    }
    this.items.set([]);
    this.cliente.set('');
    this.clienteDocumento.set('');
    this.clienteDireccion.set('');
    this.selectedCliente.set(null);
    this.descuentoGlobal.set(0);
    this.observaciones.set('');
    this.term.set('');
    this.termCliente.set('');
    this.numero.update(n => {
      const num = parseInt(n) + 1;
      return String(num).padStart(6, '0');
    });
  }
}