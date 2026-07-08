import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (supabase.currentUser()) return true;

  router.navigate(['/login'], { replaceUrl: true });
  return false;
};