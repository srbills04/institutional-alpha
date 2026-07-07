import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService, Module } from '../../services/supabase.service';

@Component({
  selector: 'app-formacion',
  imports: [RouterLink],
  templateUrl: './formacion.component.html',
  styleUrls: ['./formacion.component.css']
})
export class FormacionComponent implements OnInit {
  private supabase = inject(SupabaseService);

  protected readonly modules = signal<Module[]>([]);
  protected readonly loading = signal(true);

  async ngOnInit() {
    const { data } = await this.supabase.getModules();
    if (data) this.modules.set(data);
    this.loading.set(false);
  }
}