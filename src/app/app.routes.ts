import { Routes } from '@angular/router';
import { PosPage } from './pos/pos.page';
import { VentasPage } from './sections/ventas/ventas.page';
import { ProductosPage } from './sections/productos/productos.page';
import { ClientesPage } from './sections/clientes/clientes.page';
import { ProveedoresPage } from './sections/proveedores/proveedores.page';
import { ComprasPage } from './sections/compras/compras.page';
import { FinanzasPage } from './sections/finanzas/finanzas.page';
import { AlmacenesPage } from './sections/almacenes/almacenes.page';
import { LoginPage } from './auth/login.page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', component: PosPage, canActivate: [authGuard] },
  { path: 'ventas', component: VentasPage, canActivate: [authGuard] },
  { path: 'productos', component: ProductosPage, canActivate: [authGuard] },
  { path: 'almacenes', component: AlmacenesPage, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesPage, canActivate: [authGuard] },
  { path: 'proveedores', component: ProveedoresPage, canActivate: [authGuard] },
  { path: 'compras', component: ComprasPage, canActivate: [authGuard] },
  { path: 'finanzas', component: FinanzasPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
