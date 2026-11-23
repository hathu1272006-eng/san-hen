import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isUpcoming } from '../../../../../shared/schedule.mjs';
import { CourtApi, messageFor } from '../../core/court-api';
import { Booking, calendarLabel, endHour, money } from '../../core/models';

@Component({
  imports: [RouterLink],
  templateUrl: './bookings.page.html',
})
export class BookingsPage {
  private readonly api = inject(CourtApi);
  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly canceling = signal('');
  readonly selected = signal('');
  readonly notice = signal('');
  readonly calendarLabel = calendarLabel;
  readonly endHour = endHour;
  readonly money = money;
  readonly isUpcoming = isUpcoming;

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.bookings.set(await this.api.bookings());
    } catch (error) {
      this.error.set(messageFor(error, 'Chưa tải được lượt đặt.'));
    } finally {
      this.loading.set(false);
    }
  }

  async cancel(code: string): Promise<void> {
    if (this.canceling()) return;
    this.error.set('');
    this.notice.set('');
    this.canceling.set(code);
    try {
      await this.api.cancel(code);
      this.bookings.update(items => items.map(item => item.code === code ? { ...item, status: 'canceled' } : item));
      this.notice.set('Đã hủy lượt đặt ' + code + '.');
      this.selected.set('');
    } catch (error) {
      this.error.set(messageFor(error, 'Chưa hủy được lượt đặt.'));
    } finally {
      this.canceling.set('');
    }
  }
}
