import { Component, inject } from '@angular/core';
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

  get user() { return this.supabase.currentUser(); }
  get isAdmin() { return this.supabase.role() === 'admin'; }
  get isLoggedIn() { return !!this.user(); }

  toggleMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMenu() { this.mobileMenuOpen = false; }
}