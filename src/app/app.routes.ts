import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PropuestaComponent } from './pages/propuesta/propuesta.component';
import { HerramientasComponent } from './pages/herramientas/herramientas.component';
import { SobreMiComponent } from './pages/sobre-mi/sobre-mi.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ContenidoComponent } from './pages/contenido/contenido.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'THINKERS — Formación Algorítmica' },
  { path: 'propuesta-educativa', component: PropuestaComponent, title: 'Propuesta Educativa — THINKERS' },
  { path: 'herramientas', component: HerramientasComponent, title: 'Herramientas — THINKERS' },
  { path: 'sobre-mi', component: SobreMiComponent, title: 'Sobre mí — THINKERS' },
  { path: 'ventas', component: VentasComponent, title: 'Inscripción — THINKERS' },
  { path: 'login', component: LoginComponent, title: 'Acceder — THINKERS' },
  { path: 'dashboard', component: DashboardComponent, title: 'Mi Panel — THINKERS' },
  { path: 'perfil', component: PerfilComponent, title: 'Mi Perfil — THINKERS' },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard], title: 'Admin — THINKERS' },
  { path: 'contenido/:id', component: ContenidoComponent, canActivate: [authGuard], title: 'Contenido — THINKERS' },
  { path: '**', redirectTo: '' }
];