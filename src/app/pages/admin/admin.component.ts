import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService, Module, Lesson } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  protected readonly modules = signal<Module[]>([]);
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly selectedModule = signal<Module | null>(null);
  protected readonly editingModule = signal<Partial<Module> | null>(null);
  protected readonly editingLesson = signal<Partial<Lesson> | null>(null);
  protected readonly loading = signal(true);
  protected readonly message = signal('');

  async ngOnInit() {
    const user = this.supabase.currentUser();
    if (!user) { this.router.navigate(['/login']); return; }

    const { data: profile } = await this.supabase.getProfile(user.id);
    if (profile?.role !== 'admin') { this.router.navigate(['/dashboard']); return; }

    await this.loadModules();
    this.loading.set(false);
  }

  async loadModules() {
    const { data } = await this.supabase.getModules();
    if (data) this.modules.set(data);
  }

  selectModule(mod: Module) {
    this.selectedModule.set(mod);
    this.editingLesson.set(null);
    this.loadLessons(mod.id);
  }

  async loadLessons(moduleId: string) {
    const { data } = await this.supabase.getLessons(moduleId);
    this.lessons.set(data ?? []);
  }

  newModule() {
    const courseId = this.modules()[0]?.course_id || '';
    this.editingModule.set({ module_number: this.modules().length + 1, title: '', description: '', icon: 'school', order_index: this.modules().length + 1, course_id: courseId });
  }

  editModule(mod: Module) {
    this.editingModule.set({ ...mod });
  }

  async saveModule() {
    const m = this.editingModule();
    if (!m) return;
    const result = await this.supabase.upsertModule(m);
    if (result.error) { this.message.set('Error: ' + result.error.message); return; }
    this.editingModule.set(null);
    await this.loadModules();
    this.message.set('Módulo guardado');
    setTimeout(() => this.message.set(''), 3000);
  }

  async deleteModule(id: string) {
    await this.supabase.deleteModule(id);
    this.selectedModule.set(null);
    this.lessons.set([]);
    await this.loadModules();
  }

  newLesson() {
    const mod = this.selectedModule();
    if (!mod) return;
    this.editingLesson.set({ module_id: mod.id, title: '', description: '', video_url: '', duration_minutes: 0, order_index: this.lessons().length + 1 });
  }

  editLesson(lesson: Lesson) {
    this.editingLesson.set({ ...lesson });
  }

  async saveLesson() {
    const l = this.editingLesson();
    if (!l) return;
    const result = await this.supabase.upsertLesson(l);
    if (result.error) { this.message.set('Error: ' + result.error.message); return; }
    this.editingLesson.set(null);
    if (this.selectedModule()) this.loadLessons(this.selectedModule()!.id);
    this.message.set('Lección guardada');
    setTimeout(() => this.message.set(''), 3000);
  }

  async deleteLesson(id: string) {
    await this.supabase.deleteLesson(id);
    if (this.selectedModule()) this.loadLessons(this.selectedModule()!.id);
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}