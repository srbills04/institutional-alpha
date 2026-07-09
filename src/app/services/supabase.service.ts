import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

export interface Module {
  id: string;
  course_id: string;
  module_number: number;
  title: string;
  description: string;
  icon: string;
  content_html: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  content_html: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  readonly currentUser = signal<User | null>(null);
  readonly role = signal<string | null>(null);
  readonly roleLoaded = signal<boolean>(false);

  constructor() {
    const supabaseUrl = (typeof window !== 'undefined' && (window as any).ENV?.SUPABASE_URL) || 'https://iznqhzdudvjdeprakvdc.supabase.co';
    const supabaseKey = (typeof window !== 'undefined' && (window as any).ENV?.SUPABASE_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bnFoemR1ZHZqZGVwcmFrdmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMTYwNDgsImV4cCI6MjA5ODg5MjA0OH0.iyJnBjZnIBJtsBiKgbWrtI9i5REQNw52OpIwqj895pI';

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });

    // Process auth hash from URL if present (e.g., after email confirmation)
    if (typeof window !== 'undefined') {
      this.supabase.auth.getSession().then(({ data }) => {
        const user = data.session?.user ?? null;
        this.currentUser.set(user);
        if (user) this.loadRole(user.id);
        else { this.role.set(null); this.roleLoaded.set(true); }
        
        // Clean URL hash after processing
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
      });
    }

    this.supabase.auth.onAuthStateChange((_, session) => {
      const user = session?.user ?? null;
      this.currentUser.set(user);
      if (user) this.loadRole(user.id);
      else { this.role.set(null); this.roleLoaded.set(true); }
    });
  }

  private async loadRole(userId: string) {
    try {
      const { data } = await this.supabase.from('profiles').select('role').eq('id', userId).single();
      this.role.set(data?.role ?? 'student');
    } catch {
      this.role.set('student');
    }
    this.roleLoaded.set(true);
  }

  get client() { return this.supabase; }

  async signUp(email: string, password: string, fullName: string) {
    return this.supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.role.set(null);
    this.roleLoaded.set(true);
  }

  async getProfile(userId: string) {
    const { data } = await this.supabase.from('profiles').select('*').eq('id', userId).single();
    return { data: data as Profile | null };
  }

  async updateProfile(fullName: string) {
    const user = this.currentUser();
    if (!user) return { error: { message: 'No autenticado' } };
    return this.supabase.from('profiles').upsert({ id: user.id, full_name: fullName, email: user.email }, { onConflict: 'id' });
  }

  async getModules() {
    const { data, error } = await this.supabase.from('modules').select('*').order('order_index');
    return { data: data as Module[] | null, error };
  }

  async upsertModule(mod: Partial<Module>) {
    if (mod.id) return this.supabase.from('modules').update(mod).eq('id', mod.id);
    return this.supabase.from('modules').insert(mod);
  }

  async deleteModule(id: string) {
    return this.supabase.from('modules').delete().eq('id', id);
  }

  async getLessons(moduleId: string) {
    const { data, error } = await this.supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index');
    return { data: data as Lesson[] | null, error };
  }

  async upsertLesson(lesson: Partial<Lesson>) {
    if (lesson.id) return this.supabase.from('lessons').update(lesson).eq('id', lesson.id);
    return this.supabase.from('lessons').insert(lesson);
  }

  async deleteLesson(id: string) {
    return this.supabase.from('lessons').delete().eq('id', id);
  }

  async getStudentProgress(userId: string) {
    const { data } = await this.supabase.from('student_progress').select('*, modules(*)').eq('user_id', userId);
    return { data };
  }

  async getLessonProgress(userId: string, moduleId: string) {
    const { data } = await this.supabase.from('lesson_progress').select('*').eq('user_id', userId).eq('module_id', moduleId);
    return { data };
  }

  async saveLessonProgress(userId: string, lessonId: string, moduleId: string, videoTimestamp: number, completed: boolean) {
    return this.supabase.from('lesson_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      module_id: moduleId,
      video_timestamp: videoTimestamp,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' });
  }

  async updateProgress(userId: string, moduleId: string, percent: number) {
    const completed = percent >= 100;
    return this.supabase.from('student_progress').upsert({
      user_id: userId, module_id: moduleId,
      progress_percent: percent, completed,
      completed_at: completed ? new Date().toISOString() : null
    }, { onConflict: 'user_id,module_id' });
  }
}