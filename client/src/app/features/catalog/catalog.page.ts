import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourtApi, messageFor } from '../../core/court-api';
import { areas, Court, sports } from '../../core/models';
import { CourtCard } from '../../shared/court-card';

@Component({
  imports: [FormsModule, CourtCard],
  templateUrl: './catalog.page.html',
})
export class CatalogPage {
  private readonly api = inject(CourtApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private request = 0;
  readonly sports = sports;
  readonly areas = areas;
  readonly rows = signal<Court[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  sport = '';
  area = '';
  query = '';

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const sport = params.get('mon') ?? '';
      const area = params.get('khu') ?? '';
      this.sport = sports.some(item => item.id === sport) ? sport : '';
      this.area = areas.includes(area) ? area : '';
      this.query = (params.get('q') ?? '').slice(0, 100);
      void this.load();
    });
  }

  apply(sport = this.sport): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {
      mon: sport || null, khu: this.area || null, q: this.query.trim() || null,
    } });
  }

  clear(): void {
    this.area = '';
    this.query = '';
    this.apply('');
  }

  async load(): Promise<void> {
    const request = ++this.request;
    this.loading.set(true);
    this.error.set('');
    try {
      const rows = await this.api.courts({ sport: this.sport, area: this.area, q: this.query });
      if (this.request === request) this.rows.set(rows);
    } catch (error) {
      if (this.request === request) this.error.set(messageFor(error, 'Chưa tải được danh sách sân.'));
    } finally {
      if (this.request === request) this.loading.set(false);
    }
  }
}
