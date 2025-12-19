import { Routes } from '@angular/router';
import { PosPage } from './pos/pos.page';
import { VentasPage } from './sections/ventas/ventas.page';
import { ProductosPage } from './sections/productos/productos.page';
import { ClientesPage } from './sections/clientes/clientes.page';
import { ProveedoresPage } from './sections/proveedores/proveedores.page';
import { ComprasPage } from './sections/compras/compras.page';
import { FinanzasPage } from './sections/finanzas/finanzas.page';
import { AlmacenesPage } from './sections/almacenes/almacenes.page';

export const routes: Routes = [
  { path: '', component: PosPage },
  { path: 'ventas', component: VentasPage },
  { path: 'productos', component: ProductosPage },
  { path: 'almacenes', component: AlmacenesPage },
  { path: 'clientes', component: ClientesPage },
  { path: 'proveedores', component: ProveedoresPage },
  { path: 'compras', component: ComprasPage },
  { path: 'finanzas', component: FinanzasPage },
  { path: '**', redirectTo: '' }
];
