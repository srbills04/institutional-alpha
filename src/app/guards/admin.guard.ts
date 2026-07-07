import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const user = supabase.currentUser();

  if (!user) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // Use the role signal if already loaded for instant check
  if (supabase.roleLoaded() && supabase.role() !== 'admin') {
    router.navigate(['/dashboard'], { replaceUrl: true });
    return false;
  }

  const { data: profile } = await supabase.getProfile(user.id);
  
  if (profile?.role === 'admin') {
    supabase.role.set('admin');
    supabase.roleLoaded.set(true);
    return true;
  }

  supabase.role.set('student');
  supabase.roleLoaded.set(true);
  router.navigate(['/dashboard'], { replaceUrl: true });
  return false;
};