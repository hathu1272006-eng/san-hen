import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { bookableDays } from '../../../../../shared/schedule.mjs';
import { CourtApi, messageFor } from '../../core/court-api';
import { Booking, calendarLabel, Court, endHour, money, Slot, sportLabel } from '../../core/models';
import { CourtCard } from '../../shared/court-card';

@Component({
  imports: [RouterLink, CourtCard],
  templateUrl: './court.page.html',
})
export class CourtPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CourtApi);
  private pageRequest = 0;
  private slotRequest = 0;
  readonly days = bookableDays();
  readonly date = signal(this.days[0]);
  readonly hour = signal('');
  readonly court = signal<Court | null>(null);
  readonly related = signal<Court[]>([]);
  readonly slots = signal<Slot[]>([]);
  readonly pageError = signal('');
  readonly slotError = signal('');
  readonly bookingError = signal('');
  readonly booking = signal<Booking | null>(null);
  readonly loadingSlots = signal(true);
  readonly saving = signal(false);
  readonly money = money;
  readonly calendarLabel = calendarLabel;
  readonly sportLabel = sportLabel;
  readonly endHour = endHour;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      void this.load(params.get('slug') ?? '');
    });
  }

  async load(slug: string): Promise<void> {
    const request = ++this.pageRequest;
    this.court.set(null);
    this.pageError.set('');
    this.bookingError.set('');
    this.booking.set(null);
    this.saving.set(false);
    this.related.set([]);
    try {
      const court = await this.api.court(slug);
      if (request !== this.pageRequest) return;
      this.court.set(court);
      void this.selectDate(this.days[0]);
      const related = await this.api.recommendations(slug).catch(() => []);
      if (request === this.pageRequest) this.related.set(related);
    } catch (error) {
      if (request === this.pageRequest) this.pageError.set(messageFor(error, 'Chưa tải được thông tin sân.'));
    }
  }

  async selectDate(date: string): Promise<void> {
    const court = this.court();
    if (!court) return;
    const request = ++this.slotRequest;
    this.date.set(date);
    this.hour.set('');
    this.slotError.set('');
    this.slots.set([]);
    this.loadingSlots.set(true);
    try {
      const slots = await this.api.slots(court.slug, date);
      if (request === this.slotRequest) this.slots.set(slots);
    } catch (error) {
      if (request === this.slotRequest) this.slotError.set(messageFor(error, 'Chưa tải được lịch sân.'));
    } finally {
      if (request === this.slotRequest) this.loadingSlots.set(false);
    }
  }

  async confirm(): Promise<void> {
    const court = this.court();
    const hour = this.hour();
    if (!court || !hour || this.saving()) return;
    const page = this.pageRequest;
    const date = this.date();
    this.saving.set(true);
    this.bookingError.set('');
    this.booking.set(null);
    try {
      const booked = await this.api.book({ slug: court.slug, date, hour });
      if (this.pageRequest === page) this.booking.set(booked);
    } catch (error) {
      if (this.pageRequest === page) this.bookingError.set(messageFor(error, 'Không thể đặt sân. Vui lòng thử lại.'));
    } finally {
      if (this.pageRequest === page) {
        await this.selectDate(date);
        if (this.pageRequest === page) this.saving.set(false);
      }
    }
  }
}
