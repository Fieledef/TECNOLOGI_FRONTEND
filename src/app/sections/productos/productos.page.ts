import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar.component';
import { MockDataService, Product, Almacen } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.css']
})
export class ProductosPage {
  private data = inject(MockDataService);
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private loading = inject(LoadingService);

  productos = signal<Product[]>(this.data.getProductos());
  busqueda = signal('');
  currentPage = signal(1);
  itemsPerPage = 20;
  Math = Math;

  showModal = signal(false);
  editingProducto = signal<Product | null>(null);
  
  // Almacenes
  showAlmacenesModal = signal(false);
  productoAlmacenes = signal<Product | null>(null);

  formData = signal<Partial<Product>>({
    codigoInterno: '',
    nombre: '',
    unidad: 'UN',
    precio1: 0,
    precio2: 0,
    precio3: 0,
    tieneIGV: true,
    manejaSerie: false,
    stock: 0,
    historial: ''
  });

  almacenesSeleccionados = signal<string[]>([]);
  stockPorAlmacen = signal<Record<string, number>>({});

  filtered = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    if (!term) return this.productos();
    return this.productos().filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      p.codigoInterno.toLowerCase().includes(term)
    );
  });

  totalPages = computed(() => {
    return Math.ceil(this.filtered().length / this.itemsPerPage);
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filtered().slice(start, end);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 6) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 6; i++) {
          pages.push(i);
        }
      } else if (current >= total - 2) {
        for (let i = total - 5; i <= total; i++) {
          pages.push(i);
        }
      } else {
        for (let i = current - 2; i <= current + 3; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  });

  openModal(producto?: Product) {
    if (producto) {
      this.editingProducto.set(producto);
      this.formData.set({ ...producto });
      // Cargar almacenes del producto
      const almacenesDelProducto = this.getAlmacenesDeProducto(producto.id);
      this.almacenesSeleccionados.set(almacenesDelProducto.map(a => a.almacen.id));
      const stockMap: Record<string, number> = {};
      almacenesDelProducto.forEach(a => {
        stockMap[a.almacen.id] = a.stock;
      });
      this.stockPorAlmacen.set(stockMap);
    } else {
      this.editingProducto.set(null);
      this.formData.set({
        codigoInterno: '',
        nombre: '',
        unidad: 'UN',
        precio1: 0,
        precio2: 0,
        precio3: 0,
        tieneIGV: true,
        manejaSerie: false,
        stock: 0,
        historial: ''
      });
      this.almacenesSeleccionados.set([]);
      this.stockPorAlmacen.set({});
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProducto.set(null);
  }

  saveProducto() {
    const form = this.formData();
    
    // Validaciones mejoradas
    const errors: string[] = [];
    
    if (!form.nombre?.trim()) {
      errors.push('El nombre es requerido');
    }
    
    if (!form.codigoInterno?.trim()) {
      errors.push('El código interno es requerido');
    }
    
    if (form.precio1 === undefined || form.precio1 < 0) {
      errors.push('El precio 1 debe ser mayor o igual a 0');
    }
    
    if (form.precio2 === undefined || form.precio2 < 0) {
      errors.push('El precio 2 debe ser mayor o igual a 0');
    }
    
    if (form.precio3 !== undefined && form.precio3 < 0) {
      errors.push('El precio 3 debe ser mayor o igual a 0');
    }
    
    if (errors.length > 0) {
      this.notifications.error(
        'Error de validación',
        errors.join('. ')
      );
      return;
    }

    try {
      this.loading.start();
      
      let productoId: string;
      if (this.editingProducto()) {
        this.data.updateProducto(this.editingProducto()!.id, form);
        productoId = this.editingProducto()!.id;
        this.productos.set(this.data.getProductos());
        this.notifications.success(
          'Producto actualizado',
          `El producto "${form.nombre}" ha sido actualizado correctamente`
        );
      } else {
        const nuevoProducto = this.data.addProducto(form as Omit<Product, 'id'>);
        productoId = nuevoProducto.id;
        this.productos.set(this.data.getProductos());
        this.notifications.success(
          'Producto creado',
          `El producto "${form.nombre}" ha sido creado correctamente`
        );
      }

      // Asignar producto a almacenes seleccionados
      const almacenesSeleccionados = this.almacenesSeleccionados();
      const stockPorAlmacen = this.stockPorAlmacen();
      
      if (almacenesSeleccionados.length > 0) {
        this.data.asignarProductoAAlmacenes(productoId, almacenesSeleccionados, stockPorAlmacen);
      }

      this.closeModal();
    } catch (error) {
      this.notifications.error(
        'Error al guardar',
        'No se pudo guardar el producto. Por favor, intenta nuevamente.'
      );
    } finally {
      this.loading.stop();
    }
  }

  toggleAlmacen(almacenId: string) {
    const actuales = this.almacenesSeleccionados();
    if (actuales.includes(almacenId)) {
      this.almacenesSeleccionados.set(actuales.filter(id => id !== almacenId));
      const stockMap = { ...this.stockPorAlmacen() };
      delete stockMap[almacenId];
      this.stockPorAlmacen.set(stockMap);
    } else {
      this.almacenesSeleccionados.set([...actuales, almacenId]);
      const stockMap = { ...this.stockPorAlmacen() };
      stockMap[almacenId] = 0;
      this.stockPorAlmacen.set(stockMap);
    }
  }

  actualizarStockAlmacen(almacenId: string, stock: number) {
    const stockMap = { ...this.stockPorAlmacen() };
    stockMap[almacenId] = stock || 0;
    this.stockPorAlmacen.set(stockMap);
  }

  estaAlmacenSeleccionado(almacenId: string): boolean {
    return this.almacenesSeleccionados().includes(almacenId);
  }

  getStockAlmacen(almacenId: string): number {
    return this.stockPorAlmacen()[almacenId] || 0;
  }

  deleteProducto(id: string) {
    const producto = this.productos().find(p => p.id === id);
    const nombre = producto?.nombre || 'este producto';
    
    if (confirm(`¿Está seguro de eliminar el producto "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        this.loading.start();
        this.data.deleteProducto(id);
        this.productos.set(this.data.getProductos());
        this.notifications.success(
          'Producto eliminado',
          `El producto "${nombre}" ha sido eliminado correctamente`
        );
      } catch (error) {
        this.notifications.error(
          'Error al eliminar',
          'No se pudo eliminar el producto. Por favor, intenta nuevamente.'
        );
      } finally {
        this.loading.stop();
      }
    }
  }

  updateFormField(field: keyof Product, value: any) {
    this.formData.update(d => ({ ...d, [field]: value }));
  }

  toggleManejaSerie() {
    this.formData.update(d => ({ 
      ...d, 
      manejaSerie: !d.manejaSerie,
      serie: !d.manejaSerie ? [] : undefined
    }));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Métodos para almacenes
  openAlmacenesModal(producto: Product) {
    this.productoAlmacenes.set(producto);
    this.showAlmacenesModal.set(true);
  }

  closeAlmacenesModal() {
    this.showAlmacenesModal.set(false);
    this.productoAlmacenes.set(null);
  }

  getAlmacenesDeProducto(productoId: string) {
    return this.data.getAlmacenesDeProducto(productoId);
  }

  getTodosAlmacenes() {
    return this.data.getAlmacenes();
  }

  getAlmacenes() {
    return this.data.getAlmacenes();
  }

  // Métodos para verificar permisos
  canModify = () => this.auth.canModify();
  canDelete = () => this.auth.canDelete();
  canCreate = () => this.auth.canCreate();
  isAdmin = () => this.auth.isAdmin();
}