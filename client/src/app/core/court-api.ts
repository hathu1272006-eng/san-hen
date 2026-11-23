import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from './environment';
import { Booking, BookingRequest, Court, Filters, Slot } from './models';

@Injectable({ providedIn: 'root' })
export class CourtApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1';

  async courts(filters: Filters = {}): Promise<Court[]> {
    if (environment.demo) return (await import('./demo-store')).demoStore.courts(filters);
    return firstValueFrom(this.http.get<Court[]>(this.base + '/courts', {
      params: { sport: filters.sport ?? '', area: filters.area ?? '', q: filters.q ?? '' },
    }));
  }

  async court(slug: string): Promise<Court> {
    if (environment.demo) return (await import('./demo-store')).demoStore.court(slug);
    return firstValueFrom(this.http.get<Court>(this.courtUrl(slug)));
  }

  async slots(slug: string, date: string): Promise<Slot[]> {
    if (environment.demo) return (await import('./demo-store')).demoStore.slots(slug, date);
    return firstValueFrom(this.http.get<Slot[]>(this.courtUrl(slug) + '/slots', { params: { date } }));
  }

  async recommendations(slug: string): Promise<Court[]> {
    if (environment.demo) return (await import('./demo-store')).demoStore.recommendations(slug);
    const response = await firstValueFrom(this.http.get<{ courts: Court[] }>(this.courtUrl(slug) + '/recommendations'));
    return response.courts;
  }

  async bookings(): Promise<Booking[]> {
    if (environment.demo) return (await import('./demo-store')).demoStore.bookings();
    return firstValueFrom(this.http.get<Booking[]>(this.base + '/bookings'));
  }

  async booking(code: string): Promise<Booking> {
    if (environment.demo) return (await import('./demo-store')).demoStore.booking(code);
    return firstValueFrom(this.http.get<Booking>(this.bookingUrl(code)));
  }

  async book(request: BookingRequest): Promise<Booking> {
    if (environment.demo) return (await import('./demo-store')).demoStore.book(request);
    return firstValueFrom(this.http.post<Booking>(this.base + '/bookings', request));
  }

  async pay(code: string): Promise<Booking> {
    if (environment.demo) return (await import('./demo-store')).demoStore.pay(code);
    return firstValueFrom(this.http.post<Booking>(this.bookingUrl(code) + '/payment', { method: 'demo' }));
  }

  async cancel(code: string): Promise<void> {
    if (environment.demo) return (await import('./demo-store')).demoStore.cancel(code);
    await firstValueFrom(this.http.post(this.bookingUrl(code) + '/cancel', {}));
  }

  private bookingUrl(code: string): string {
    return this.base + '/bookings/' + encodeURIComponent(code);
  }

  private courtUrl(slug: string): string {
    return this.base + '/courts/' + encodeURIComponent(slug);
  }
}

export function messageFor(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    return typeof error.error?.message === 'string' ? error.error.message : fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
