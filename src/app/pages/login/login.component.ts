import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
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
        this.success.set('Cuenta creada. Revisa tu correo para confirmar.');
        return;
      }

      this.router.navigate(['/dashboard']);
    } else {
      const { data, error } = await this.supabase.signIn(this.email(), this.password());
      this.loading.set(false);

      if (error) {
        this.error.set(error.message);
        return;
      }

      this.router.navigate(['/dashboard']);
    }
  }
}
