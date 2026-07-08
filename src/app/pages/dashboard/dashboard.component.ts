import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService, Module } from '../../services/supabase.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  protected readonly userEmail = signal('');
  protected readonly userName = signal('');
  protected readonly modules = signal<Module[]>([]);
  protected readonly loading = signal(true);
  protected readonly moduleProgress = signal<Record<string, number>>({});
  protected readonly completedCount = signal(0);
  protected readonly overallProgress = signal(0);

  async ngOnInit() {
    const user = this.supabase.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail.set(user.email ?? '');
    this.userName.set((user.user_metadata?.['full_name'] as string) ?? 'Estudiante');

    const { data: modules } = await this.supabase.getModules();
    if (modules) this.modules.set(modules);

    if (modules && modules.length > 0) {
      const progressMap: Record<string, number> = {};
      let totalLessons = 0;
      let completedLessons = 0;

      await Promise.all(modules.map(async mod => {
        const { data: lessonProgress } = await this.supabase.getLessonProgress(user.id, mod.id);
        const { data: lessons } = await this.supabase.getLessons(mod.id);
        const total = lessons?.length ?? 1;
        const completed = lessonProgress?.filter(lp => lp.completed).length ?? 0;
        progressMap[mod.id] = Math.round((completed / total) * 100);
        totalLessons += total;
        completedLessons += completed;
      }));

      this.moduleProgress.set(progressMap);
      const completedModules = Object.values(progressMap).filter(p => p >= 100).length;
      this.completedCount.set(completedModules);
      this.overallProgress.set(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
    }

    this.loading.set(false);
  }

  getModuleProgress(modId: string): number {
    return this.moduleProgress()[modId] ?? 0;
  }

  isModuleLocked(index: number): boolean {
    if (index === 0) return false;
    const prevMod = this.modules()[index - 1];
    return this.getModuleProgress(prevMod.id) < 100;
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
