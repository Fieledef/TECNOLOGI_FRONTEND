import { Injectable, signal } from '@angular/core';

export interface Product {
  id: string;
  codigoInterno: string;
  unidad: string;
  nombre: string;
  historial?: string;
  stock?: number;
  precio1: number;
  precio2: number;
  precio3?: number;
  tieneIGV: boolean;
  manejaSerie: boolean;
  serie?: string[];
}

export interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
}

export interface ProductoEnAlmacen {
  productoId: string;
  almacenId: string;
  stock: number;
  serie?: string[];
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private productosData: Product[] = [
    { 
      id: '1', 
      codigoInterno: 'P001', 
      nombre: 'Teclado Mecánico', 
      unidad: 'UN', 
      stock: 12, 
      precio1: 200.00, 
      precio2: 236.00, 
      precio3: 270.00,
      tieneIGV: true,
      manejaSerie: false,
      historial: 'Última compra: 15/03/2024'
    },
    { 
      id: '2', 
      codigoInterno: 'P002', 
      nombre: 'Mouse Inalámbrico', 
      unidad: 'UN', 
      stock: 8, 
      precio1: 70.00, 
      precio2: 82.60, 
      precio3: 95.00,
      tieneIGV: true,
      manejaSerie: false,
      historial: 'Última compra: 10/03/2024'
    },
    { 
      id: '3', 
      codigoInterno: 'P003', 
      nombre: 'Silla Ergonómica', 
      unidad: 'UN', 
      stock: 5, 
      precio1: 450.00, 
      precio2: 531.00, 
      precio3: 600.00,
      tieneIGV: true,
      manejaSerie: true,
      serie: ['S001', 'S002', 'S003', 'S004', 'S005'],
      historial: 'Última compra: 05/03/2024'
    },
    { 
      id: '4', 
      codigoInterno: 'P004', 
      nombre: 'Monitor 24"', 
      unidad: 'UN', 
      stock: 3, 
      precio1: 500.00, 
      precio2: 590.00, 
      precio3: 650.00,
      tieneIGV: true,
      manejaSerie: true,
      serie: ['M001', 'M002', 'M003'],
      historial: 'Última compra: 01/03/2024'
    },
    { 
      id: '5', 
      codigoInterno: 'P005', 
      nombre: 'Papel A4', 
      unidad: 'UN', 
      stock: 50, 
      precio1: 50.00, 
      precio2: 59.00, 
      precio3: 65.00,
      tieneIGV: true,
      manejaSerie: false,
      historial: 'Última compra: 20/03/2024'
    },
    { id: '6', codigoInterno: 'P006', nombre: 'Impresora Laser', unidad: 'UN', stock: 4, precio1: 800.00, precio2: 944.00, precio3: 1000.00, tieneIGV: true, manejaSerie: true, serie: ['I001', 'I002', 'I003', 'I004'], historial: 'Última compra: 18/03/2024' },
    { id: '7', codigoInterno: 'P007', nombre: 'Cable USB-C', unidad: 'UN', stock: 25, precio1: 15.00, precio2: 17.70, precio3: 20.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 22/03/2024' },
    { id: '8', codigoInterno: 'P008', nombre: 'Auriculares Bluetooth', unidad: 'UN', stock: 10, precio1: 120.00, precio2: 141.60, precio3: 160.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 12/03/2024' },
    { id: '9', codigoInterno: 'P009', nombre: 'Webcam HD', unidad: 'UN', stock: 6, precio1: 180.00, precio2: 212.40, precio3: 240.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 08/03/2024' },
    { id: '10', codigoInterno: 'P010', nombre: 'Disco Duro Externo 1TB', unidad: 'UN', stock: 7, precio1: 350.00, precio2: 413.00, precio3: 450.00, tieneIGV: true, manejaSerie: true, serie: ['D001', 'D002', 'D003', 'D004', 'D005', 'D006', 'D007'], historial: 'Última compra: 14/03/2024' },
    { id: '11', codigoInterno: 'P011', nombre: 'Memoria RAM 8GB', unidad: 'UN', stock: 15, precio1: 150.00, precio2: 177.00, precio3: 200.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 16/03/2024' },
    { id: '12', codigoInterno: 'P012', nombre: 'Router WiFi', unidad: 'UN', stock: 9, precio1: 250.00, precio2: 295.00, precio3: 320.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 11/03/2024' },
    { id: '13', codigoInterno: 'P013', nombre: 'Tablet 10"', unidad: 'UN', stock: 2, precio1: 600.00, precio2: 708.00, precio3: 750.00, tieneIGV: true, manejaSerie: true, serie: ['T001', 'T002'], historial: 'Última compra: 03/03/2024' },
    { id: '14', codigoInterno: 'P014', nombre: 'Teclado Inalámbrico', unidad: 'UN', stock: 11, precio1: 90.00, precio2: 106.20, precio3: 120.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 19/03/2024' },
    { id: '15', codigoInterno: 'P015', nombre: 'Mouse Pad', unidad: 'UN', stock: 30, precio1: 20.00, precio2: 23.60, precio3: 25.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 25/03/2024' },
    { id: '16', codigoInterno: 'P016', nombre: 'Hub USB 4 Puertos', unidad: 'UN', stock: 18, precio1: 45.00, precio2: 53.10, precio3: 60.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 17/03/2024' },
    { id: '17', codigoInterno: 'P017', nombre: 'Micrófono USB', unidad: 'UN', stock: 5, precio1: 200.00, precio2: 236.00, precio3: 260.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 09/03/2024' },
    { id: '18', codigoInterno: 'P018', nombre: 'Laptop Stand', unidad: 'UN', stock: 8, precio1: 80.00, precio2: 94.40, precio3: 110.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 13/03/2024' },
    { id: '19', codigoInterno: 'P019', nombre: 'Cargador Universal', unidad: 'UN', stock: 20, precio1: 35.00, precio2: 41.30, precio3: 45.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 21/03/2024' },
    { id: '20', codigoInterno: 'P020', nombre: 'Base para Monitor', unidad: 'UN', stock: 6, precio1: 100.00, precio2: 118.00, precio3: 130.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 07/03/2024' },
    { id: '21', codigoInterno: 'P021', nombre: 'Switch de Red 8 Puertos', unidad: 'UN', stock: 4, precio1: 300.00, precio2: 354.00, precio3: 380.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 06/03/2024' },
    { id: '22', codigoInterno: 'P022', nombre: 'Adaptador HDMI', unidad: 'UN', stock: 22, precio1: 25.00, precio2: 29.50, precio3: 35.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 24/03/2024' },
    { id: '23', codigoInterno: 'P023', nombre: 'Proyector LED', unidad: 'UN', stock: 3, precio1: 1200.00, precio2: 1416.00, precio3: 1500.00, tieneIGV: true, manejaSerie: true, serie: ['PR001', 'PR002', 'PR003'], historial: 'Última compra: 02/03/2024' },
    { id: '24', codigoInterno: 'P024', nombre: 'Batería Externa 20000mAh', unidad: 'UN', stock: 12, precio1: 110.00, precio2: 129.80, precio3: 140.00, tieneIGV: true, manejaSerie: false, historial: 'Última compra: 23/03/2024' },
    { id: '25', codigoInterno: 'P025', nombre: 'Cámara IP', unidad: 'UN', stock: 5, precio1: 400.00, precio2: 472.00, precio3: 500.00, tieneIGV: true, manejaSerie: true, serie: ['C001', 'C002', 'C003', 'C004', 'C005'], historial: 'Última compra: 04/03/2024' },
  ];

  productos = signal<Product[]>(this.productosData);

  getProductos() {
    return this.productos();
  }

  addProducto(producto: Omit<Product, 'id'>) {
    const newProducto: Product = {
      ...producto,
      id: crypto.randomUUID(),
      serie: producto.manejaSerie ? (producto.serie || []) : undefined
    };
    this.productos.update(list => [...list, newProducto]);
    return newProducto;
  }

  updateProducto(id: string, producto: Partial<Product>) {
    this.productos.update(list =>
      list.map(p => p.id === id ? { ...p, ...producto } : p)
    );
  }

  deleteProducto(id: string) {
    this.productos.update(list => list.filter(p => p.id !== id));
  }

  getProductoById(id: string) {
    return this.productos().find(p => p.id === id);
  }

  // Almacenes
  private almacenesData: Almacen[] = [
    { id: 'alm1', codigo: 'STAN 20', nombre: 'STAN 20' },
    { id: 'alm2', codigo: 'STAN 204', nombre: 'STAN 204' },
    { id: 'alm3', codigo: 'STAN B102', nombre: 'STAN B102' }
  ];

  // Relación productos-almacenes (productoId -> almacenId -> stock)
  private productosEnAlmacenesData: ProductoEnAlmacen[] = [
    // STAN 20
    { productoId: '1', almacenId: 'alm1', stock: 5 },
    { productoId: '1', almacenId: 'alm2', stock: 4 },
    { productoId: '1', almacenId: 'alm3', stock: 3 },
    { productoId: '2', almacenId: 'alm1', stock: 3 },
    { productoId: '2', almacenId: 'alm2', stock: 5 },
    { productoId: '3', almacenId: 'alm1', stock: 2 },
    { productoId: '3', almacenId: 'alm3', stock: 3 },
    { productoId: '4', almacenId: 'alm1', stock: 1 },
    { productoId: '4', almacenId: 'alm2', stock: 2 },
    { productoId: '5', almacenId: 'alm1', stock: 20 },
    { productoId: '5', almacenId: 'alm2', stock: 15 },
    { productoId: '5', almacenId: 'alm3', stock: 15 },
    { productoId: '6', almacenId: 'alm2', stock: 2 },
    { productoId: '6', almacenId: 'alm3', stock: 2 },
    { productoId: '7', almacenId: 'alm1', stock: 10 },
    { productoId: '7', almacenId: 'alm2', stock: 8 },
    { productoId: '7', almacenId: 'alm3', stock: 7 },
    { productoId: '8', almacenId: 'alm1', stock: 4 },
    { productoId: '8', almacenId: 'alm2', stock: 6 },
    { productoId: '9', almacenId: 'alm2', stock: 3 },
    { productoId: '9', almacenId: 'alm3', stock: 3 },
    { productoId: '10', almacenId: 'alm1', stock: 3 },
    { productoId: '10', almacenId: 'alm2', stock: 4 },
    { productoId: '11', almacenId: 'alm1', stock: 8 },
    { productoId: '11', almacenId: 'alm2', stock: 7 },
    { productoId: '12', almacenId: 'alm1', stock: 4 },
    { productoId: '12', almacenId: 'alm3', stock: 5 },
    { productoId: '13', almacenId: 'alm2', stock: 1 },
    { productoId: '13', almacenId: 'alm3', stock: 1 },
    { productoId: '14', almacenId: 'alm1', stock: 6 },
    { productoId: '14', almacenId: 'alm2', stock: 5 },
    { productoId: '15', almacenId: 'alm1', stock: 12 },
    { productoId: '15', almacenId: 'alm2', stock: 10 },
    { productoId: '15', almacenId: 'alm3', stock: 8 },
    { productoId: '16', almacenId: 'alm1', stock: 8 },
    { productoId: '16', almacenId: 'alm2', stock: 10 },
    { productoId: '17', almacenId: 'alm3', stock: 5 },
    { productoId: '18', almacenId: 'alm1', stock: 4 },
    { productoId: '18', almacenId: 'alm2', stock: 4 },
    { productoId: '19', almacenId: 'alm1', stock: 8 },
    { productoId: '19', almacenId: 'alm2', stock: 7 },
    { productoId: '19', almacenId: 'alm3', stock: 5 },
    { productoId: '20', almacenId: 'alm2', stock: 3 },
    { productoId: '20', almacenId: 'alm3', stock: 3 },
    { productoId: '21', almacenId: 'alm1', stock: 2 },
    { productoId: '21', almacenId: 'alm2', stock: 2 },
    { productoId: '22', almacenId: 'alm1', stock: 10 },
    { productoId: '22', almacenId: 'alm2', stock: 12 },
    { productoId: '23', almacenId: 'alm1', stock: 1 },
    { productoId: '23', almacenId: 'alm2', stock: 1 },
    { productoId: '23', almacenId: 'alm3', stock: 1 },
    { productoId: '24', almacenId: 'alm1', stock: 5 },
    { productoId: '24', almacenId: 'alm2', stock: 4 },
    { productoId: '24', almacenId: 'alm3', stock: 3 },
    { productoId: '25', almacenId: 'alm2', stock: 2 },
    { productoId: '25', almacenId: 'alm3', stock: 3 }
  ];

  almacenes = signal<Almacen[]>(this.almacenesData);
  productosEnAlmacenes = signal<ProductoEnAlmacen[]>(this.productosEnAlmacenesData);

  getAlmacenes() {
    return this.almacenes();
  }

  getAlmacenById(id: string) {
    return this.almacenes().find(a => a.id === id);
  }

  getProductosEnAlmacen(almacenId: string) {
    const productosEnAlmacen = this.productosEnAlmacenes().filter(pa => pa.almacenId === almacenId);
    return productosEnAlmacen.map(pa => {
      const producto = this.getProductoById(pa.productoId);
      return {
        ...producto!,
        stockEnAlmacen: pa.stock,
        serieEnAlmacen: pa.serie
      };
    }).filter(p => p !== undefined);
  }

  getAlmacenesDeProducto(productoId: string) {
    const almacenesDelProducto = this.productosEnAlmacenes().filter(pa => pa.productoId === productoId);
    return almacenesDelProducto.map(pa => {
      const almacen = this.getAlmacenById(pa.almacenId);
      return {
        almacen: almacen!,
        stock: pa.stock,
        serie: pa.serie
      };
    }).filter(a => a.almacen !== undefined);
  }

  asignarProductoAAlmacenes(productoId: string, almacenesIds: string[], stockPorAlmacen: Record<string, number>) {
    // Eliminar asignaciones existentes del producto
    this.productosEnAlmacenes.update(list => 
      list.filter(pa => pa.productoId !== productoId)
    );

    // Agregar nuevas asignaciones
    const nuevasAsignaciones: ProductoEnAlmacen[] = almacenesIds.map(almacenId => ({
      productoId,
      almacenId,
      stock: stockPorAlmacen[almacenId] || 0
    }));

    this.productosEnAlmacenes.update(list => [...list, ...nuevasAsignaciones]);
  }
}