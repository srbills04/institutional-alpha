import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupabaseService, Lesson, Module } from '../../services/supabase.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contenido',
  imports: [RouterLink],
  templateUrl: './contenido.component.html',
  styleUrls: ['./contenido.component.css']
})
export class ContenidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  private sanitizer = inject(DomSanitizer);

  protected readonly module = signal<Module | null>(null);
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly selectedLesson = signal<Lesson | null>(null);
  protected readonly loading = signal(true);
  protected readonly progress = signal(0);
  protected readonly videoUrl = signal<SafeResourceUrl | null>(null);

  async ngOnInit() {
    const moduleId = this.route.snapshot.paramMap.get('id');
    if (!moduleId) return;

    const { data: modules } = await this.supabase.getModules();
    const mod = modules?.find(m => m.id === moduleId) ?? null;
    this.module.set(mod);

    const { data: lessons } = await this.supabase.getLessons(moduleId);
    this.lessons.set(lessons ?? []);

    const user = this.supabase.currentUser();
    if (user) {
      const { data } = await this.supabase.getStudentProgress(user.id);
      const prog = data?.find(p => p.module_id === moduleId);
      this.progress.set(prog?.progress_percent ?? 0);
    }

    if (lessons && lessons.length > 0) {
      this.selectLesson(lessons[0]);
    }

    this.loading.set(false);
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson.set(lesson);
    this.videoUrl.set(null);

    if (lesson.video_url) {
      const id = this.extractYoutubeId(lesson.video_url);
      if (id) {
        const url = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0`
        );
        this.videoUrl.set(url);
      }
    }
  }

  private extractYoutubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^/?]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  async markProgress(percent: number) {
    const user = this.supabase.currentUser();
    const mod = this.module();
    if (!user || !mod) return;

    await this.supabase.updateProgress(user.id, mod.id, percent);
    this.progress.set(percent);
  }
}