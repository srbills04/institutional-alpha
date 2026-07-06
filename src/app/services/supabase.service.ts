import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  readonly currentUser = signal<User | null>(null);
  readonly loading = signal(false);

  constructor() {
    this.supabase = createClient(
      'https://iznqhzdudvjdeprakvdc.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bnFoemR1ZHZqZGVwcmFrdmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMTYwNDgsImV4cCI6MjA5ODg5MjA0OH0.iyJnBjZnIBJtsBiKgbWrtI9i5REQNw52OpIwqj895pI'
    );

    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.set(data.session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((_, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async signUp(email: string, password: string, fullName: string) {
    this.loading.set(true);
    const result = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    this.loading.set(false);
    return result;
  }

  async signIn(email: string, password: string) {
    this.loading.set(true);
    const result = await this.supabase.auth.signInWithPassword({ email, password });
    this.loading.set(false);
    return result;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async getModules() {
    const { data, error } = await this.supabase
      .from('modules')
      .select('*')
      .order('order_index', { ascending: true });
    return { data, error };
  }

  async getStudentProgress(userId: string) {
    const { data, error } = await this.supabase
      .from('student_progress')
      .select('*, modules(*)')
      .eq('user_id', userId);
    return { data, error };
  }

  async updateProgress(userId: string, moduleId: string, percent: number) {
    const completed = percent >= 100;
    return this.supabase
      .from('student_progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        progress_percent: percent,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      }, { onConflict: 'user_id,module_id' });
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }
}
