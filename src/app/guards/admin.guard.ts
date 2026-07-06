import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const user = supabase.currentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const { data: profile } = await supabase.getProfile(user.id);
  if (profile?.role === 'admin') return true;

  router.navigate(['/dashboard']);
  return false;
};