import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PropuestaComponent } from './pages/propuesta/propuesta.component';
import { FormacionComponent } from './pages/formacion/formacion.component';
import { HerramientasComponent } from './pages/herramientas/herramientas.component';
import { SobreMiComponent } from './pages/sobre-mi/sobre-mi.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'propuesta-educativa', component: PropuestaComponent },
  { path: 'formacion', component: FormacionComponent },
  { path: 'herramientas', component: HerramientasComponent },
  { path: 'sobre-mi', component: SobreMiComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];
