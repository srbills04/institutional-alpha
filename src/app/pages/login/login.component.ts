import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly fullName = signal('');
  protected readonly isSignUp = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');

  toggleMode() {
    this.isSignUp.update(v => !v);
    this.error.set('');
    this.success.set('');
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    if (this.isSignUp()) {
      const { data, error } = await this.supabase.signUp(this.email(), this.password(), this.fullName());
      this.loading.set(false);

      if (error) {
        this.error.set(error.message);
        return;
      }

      if (data.user && !data.session) {
        this.success.set('Cuenta creada. Revisa tu correo para confirmar. Una vez confirmado, inicia sesión.');
        this.email.set('');
        this.password.set('');
        this.fullName.set('');
        return;
      }

      if (data.session) {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
        return;
      }

      this.error.set('No se pudo crear la cuenta. Intenta de nuevo.');
    } else {
      const { data, error } = await this.supabase.signIn(this.email(), this.password());
      this.loading.set(false);

      if (error) {
        this.error.set(error.message);
        return;
      }

      if (data.session) {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
        return;
      }

      this.error.set('Credenciales inválidas.');
    }
  }
}
