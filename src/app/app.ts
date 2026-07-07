import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  mobileMenuOpen = false;
  private supabase = inject(SupabaseService);

  protected readonly currentUser = this.supabase.currentUser;
  protected readonly role = this.supabase.role;
  protected readonly isLoggedIn = computed(() => !!this.supabase.currentUser());
  protected readonly isAdmin = computed(() => this.supabase.role() === 'admin');

  toggleMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMenu() { this.mobileMenuOpen = false; }
}