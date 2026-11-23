import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CourtApi } from '../../core/court-api';
import { areas, Court, sports } from '../../core/models';
import { CourtCard } from '../../shared/court-card';

@Component({
  imports: [FormsModule, RouterLink, CourtCard],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly api = inject(CourtApi);
  private readonly router = inject(Router);
  readonly sports = sports;
  readonly areas = areas;
  readonly featured = signal<Court[]>([]);
  readonly loading = signal(true);
  readonly failed = signal(false);
  sport = '';
  area = '';

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.failed.set(false);
    try {
      this.featured.set((await this.api.courts()).slice(0, 3));
    } catch {
      this.failed.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  search(): void {
    void this.router.navigate(['/san'], { queryParams: { mon: this.sport || null, khu: this.area || null } });
  }
}
