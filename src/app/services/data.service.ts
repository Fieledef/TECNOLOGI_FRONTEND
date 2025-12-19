import { Injectable, signal } from '@angular/core';

export interface Cliente {
  id: string;
  tipoDocumento: 'DNI' | 'RUC' | 'CE';
  numeroDocumento: string;
  nombre: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: 'activo' | 'inactivo';
  fechaRegistro: string;
}

export interface Proveedor {
  id: string;
  tipoDocumento: 'RUC' | 'DNI';
  numeroDocumento: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  estado: 'activo' | 'inactivo';
  fechaRegistro: string;
}

export interface Venta {
  id: string;
  serie: string;
  numero: string;
  fecha: string;
  clienteId: string;
  clienteNombre: string;
  tipoComprobante: 'Boleta' | 'Factura';
  moneda: 'PEN' | 'USD';
  subtotal: number;
  igv: number;
  total: number;
  estado: 'pendiente' | 'pagado' | 'anulado';
  items: VentaItem[];
}

export interface VentaItem {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Compra {
  id: string;
  serie: string;
  numero: string;
  fecha: string;
  proveedorId: string;
  proveedorNombre: string;
  moneda: 'PEN' | 'USD';
  subtotal: number;
  igv: number;
  total: number;
  estado: 'pendiente' | 'pagado' | 'anulado';
  items: CompraItem[];
}

export interface CompraItem {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private clientesData: Cliente[] = [
    { id: '1', tipoDocumento: 'DNI', numeroDocumento: '12345678', nombre: 'Juan Pérez', direccion: 'Av. Principal 123', telefono: '987654321', email: 'juan@email.com', estado: 'activo', fechaRegistro: '2024-01-15' },
    { id: '2', tipoDocumento: 'RUC', numeroDocumento: '20123456789', nombre: 'María García', razonSocial: 'García & Asociados S.A.C.', direccion: 'Jr. Comercio 456', telefono: '987654322', email: 'maria@email.com', estado: 'activo', fechaRegistro: '2024-02-20' },
    { id: '3', tipoDocumento: 'DNI', numeroDocumento: '87654321', nombre: 'Carlos López', direccion: 'Calle Los Olivos 789', telefono: '987654323', email: 'carlos@email.com', estado: 'activo', fechaRegistro: '2024-03-10' },
    { id: '4', tipoDocumento: 'CE', numeroDocumento: 'CE123456', nombre: 'Ana Martínez', direccion: 'Av. Libertad 321', telefono: '987654324', email: 'ana@email.com', estado: 'inactivo', fechaRegistro: '2024-01-05' },
  ];

  private proveedoresData: Proveedor[] = [
    { id: '1', tipoDocumento: 'RUC', numeroDocumento: '20111111111', razonSocial: 'Distribuidora ABC S.A.C.', nombreComercial: 'ABC Distribuidora', direccion: 'Av. Industrial 100', telefono: '987111111', email: 'contacto@abc.com', contacto: 'Roberto Silva', estado: 'activo', fechaRegistro: '2024-01-10' },
    { id: '2', tipoDocumento: 'RUC', numeroDocumento: '20222222222', razonSocial: 'Importadora XYZ E.I.R.L.', nombreComercial: 'XYZ Import', direccion: 'Jr. Comercio 200', telefono: '987222222', email: 'ventas@xyz.com', contacto: 'Laura Torres', estado: 'activo', fechaRegistro: '2024-02-15' },
    { id: '3', tipoDocumento: 'RUC', numeroDocumento: '20333333333', razonSocial: 'Tecnología Moderna S.A.C.', nombreComercial: 'TechMod', direccion: 'Av. Tecnología 300', telefono: '987333333', email: 'info@techmod.com', contacto: 'Pedro Ramírez', estado: 'activo', fechaRegistro: '2024-03-01' },
  ];

  private ventasData: Venta[] = [
    {
      id: '1',
      serie: 'F001',
      numero: '000001',
      fecha: '2024-03-15',
      clienteId: '1',
      clienteNombre: 'Juan Pérez',
      tipoComprobante: 'Factura',
      moneda: 'PEN',
      subtotal: 1000.00,
      igv: 180.00,
      total: 1180.00,
      estado: 'pagado',
      items: [
        { productoId: 'P002', productoNombre: 'Teclado Mecánico', cantidad: 2, precioUnitario: 236.0, subtotal: 472.0 },
        { productoId: 'P003', productoNombre: 'Mouse Inalámbrico', cantidad: 3, precioUnitario: 82.6, subtotal: 247.8 },
      ]
    },
    {
      id: '2',
      serie: 'B001',
      numero: '000001',
      fecha: '2024-03-16',
      clienteId: '2',
      clienteNombre: 'María García',
      tipoComprobante: 'Boleta',
      moneda: 'PEN',
      subtotal: 500.00,
      igv: 90.00,
      total: 590.00,
      estado: 'pendiente',
      items: [
        { productoId: 'P001', productoNombre: 'Servicio de Soporte', cantidad: 1, precioUnitario: 118.0, subtotal: 118.0 },
      ]
    },
  ];

  private comprasData: Compra[] = [
    {
      id: '1',
      serie: 'F001',
      numero: '000001',
      fecha: '2024-03-10',
      proveedorId: '1',
      proveedorNombre: 'Distribuidora ABC S.A.C.',
      moneda: 'PEN',
      subtotal: 2000.00,
      igv: 360.00,
      total: 2360.00,
      estado: 'pagado',
      items: [
        { productoId: 'P002', productoNombre: 'Teclado Mecánico', cantidad: 10, precioUnitario: 200.0, subtotal: 2000.0 },
      ]
    },
  ];

  clientes = signal<Cliente[]>(this.clientesData);
  proveedores = signal<Proveedor[]>(this.proveedoresData);
  ventas = signal<Venta[]>(this.ventasData);
  compras = signal<Compra[]>(this.comprasData);

  getClientes() {
    return this.clientes();
  }

  getProveedores() {
    return this.proveedores();
  }

  getVentas() {
    return this.ventas();
  }

  getCompras() {
    return this.compras();
  }

  addCliente(cliente: Omit<Cliente, 'id' | 'fechaRegistro'>) {
    const newCliente: Cliente = {
      ...cliente,
      id: crypto.randomUUID(),
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    this.clientes.update(list => [...list, newCliente]);
    return newCliente;
  }

  updateCliente(id: string, cliente: Partial<Cliente>) {
    this.clientes.update(list =>
      list.map(c => c.id === id ? { ...c, ...cliente } : c)
    );
  }

  deleteCliente(id: string) {
    this.clientes.update(list => list.filter(c => c.id !== id));
  }

  addProveedor(proveedor: Omit<Proveedor, 'id' | 'fechaRegistro'>) {
    const newProveedor: Proveedor = {
      ...proveedor,
      id: crypto.randomUUID(),
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    this.proveedores.update(list => [...list, newProveedor]);
    return newProveedor;
  }

  updateProveedor(id: string, proveedor: Partial<Proveedor>) {
    this.proveedores.update(list =>
      list.map(p => p.id === id ? { ...p, ...proveedor } : p)
    );
  }

  deleteProveedor(id: string) {
    this.proveedores.update(list => list.filter(p => p.id !== id));
  }

  addVenta(venta: Omit<Venta, 'id'>) {
    const newVenta: Venta = {
      ...venta,
      id: crypto.randomUUID()
    };
    this.ventas.update(list => [...list, newVenta]);
    return newVenta;
  }

  addCompra(compra: Omit<Compra, 'id'>) {
    const newCompra: Compra = {
      ...compra,
      id: crypto.randomUUID()
    };
    this.compras.update(list => [...list, newCompra]);
    return newCompra;
  }
}
