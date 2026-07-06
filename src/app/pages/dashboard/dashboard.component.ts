import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  protected readonly userEmail = signal('');
  protected readonly userName = signal('');
  protected readonly modules = signal<any[]>([]);
  protected readonly progress = signal<any[]>([]);
  protected readonly loading = signal(true);
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

    await Promise.all([
      this.loadModules(),
      this.loadProgress(user.id)
    ]);

    this.loading.set(false);
  }

  private async loadModules() {
    const { data } = await this.supabase.getModules();
    if (data) this.modules.set(data);
  }

  private async loadProgress(userId: string) {
    const { data } = await this.supabase.getStudentProgress(userId);
    if (data) {
      this.progress.set(data);
      const completed = data.filter(p => p.completed).length;
      this.completedCount.set(completed);
      const total = this.modules().length || 1;
      this.overallProgress.set(Math.round((completed / total) * 100));
    } else {
      // No progress yet, start at 0
      this.overallProgress.set(0);
    }
  }

  getModuleProgress(moduleId: string): number {
    const p = this.progress().find(pr => pr.module_id === moduleId);
    return p?.progress_percent ?? 0;
  }

  async markComplete(moduleId: string) {
    const user = this.supabase.currentUser();
    if (!user) return;

    await this.supabase.updateProgress(user.id, moduleId, 100);
    await this.loadProgress(user.id);
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
