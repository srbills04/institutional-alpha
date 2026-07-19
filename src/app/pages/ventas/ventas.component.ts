import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-ventas',
  imports: [ReactiveFormsModule],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    email: ['', [Validators.required, Validators.email]],
    exnessAccount: ['', [Validators.required, Validators.minLength(4)]],
  });

  submitted = false;
  success = false;
  error = '';

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted = true;
    this.error = '';
    try {
      const { error } = await this.supabase.submitCommunityLead({
        full_name: this.form.value.fullName!,
        phone: this.form.value.phone!,
        email: this.form.value.email!,
        exness_account: this.form.value.exnessAccount!,
      });
      if (error) throw error;
      this.success = true;
    } catch (e: any) {
      this.error = e?.message || 'Error al enviar. Intentá de nuevo.';
    } finally {
      this.submitted = false;
    }
  }
}