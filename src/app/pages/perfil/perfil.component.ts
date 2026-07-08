import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-perfil',
  imports: [RouterLink, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  protected readonly fullName = signal('');
  protected readonly email = signal('');
  protected readonly role = signal('');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');

  async ngOnInit() {
    const user = this.supabase.currentUser();
    if (!user) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.email.set(user.email ?? '');
    this.fullName.set((user.user_metadata?.['full_name'] as string) ?? '');

    const { data: profile } = await this.supabase.getProfile(user.id);
    this.role.set(profile?.role === 'admin' ? 'Admin' : 'Estudiante');

    this.loading.set(false);
  }

  async save() {
    const user = this.supabase.currentUser();
    if (!user) return;

    this.saving.set(true);
    this.error.set('');
    this.message.set('');

    const { error } = await this.supabase.updateProfile(this.fullName());
    this.saving.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.message.set('Perfil actualizado correctamente.');
    setTimeout(() => this.message.set(''), 3000);
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}