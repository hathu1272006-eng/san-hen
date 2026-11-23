import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourtApi, messageFor } from '../../core/court-api';
import { Booking, calendarLabel, canPay, endHour, money, paymentLabel, timestampLabel } from '../../core/models';

@Component({
  imports: [RouterLink],
  templateUrl: './payment.page.html',
})
export class PaymentPage {
  private readonly api = inject(CourtApi);
  private readonly route = inject(ActivatedRoute);
  private attempt = 0;
  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);
  readonly paying = signal(false);
  readonly loadError = signal('');
  readonly paymentError = signal('');
  readonly receipt = computed(() => {
    const payment = this.booking()?.payment;
    return payment && payment.status !== 'unpaid' ? payment : null;
  });
  readonly calendarLabel = calendarLabel;
  readonly canPay = canPay;
  readonly endHour = endHour;
  readonly money = money;
  readonly paymentLabel = paymentLabel;
  readonly timestampLabel = timestampLabel;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(() => void this.load());
  }

  async load(): Promise<void> {
    const attempt = ++this.attempt;
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    this.loading.set(true);
    this.booking.set(null);
    this.loadError.set('');
    this.paymentError.set('');

    try {
      const booking = await this.api.booking(code);
      if (attempt === this.attempt) this.booking.set(booking);
    } catch (error) {
      if (attempt === this.attempt) this.loadError.set(messageFor(error, 'Chưa tải được thông tin thanh toán.'));
    } finally {
      if (attempt === this.attempt) this.loading.set(false);
    }
  }

  async pay(): Promise<void> {
    const booking = this.booking();
    if (!booking || !canPay(booking) || this.paying()) return;

    const attempt = this.attempt;
    this.paying.set(true);
    this.paymentError.set('');
    try {
      const updated = await this.api.pay(booking.code);
      if (attempt === this.attempt) this.booking.set(updated);
    } catch (error) {
      if (attempt === this.attempt) this.paymentError.set(messageFor(error, 'Chưa thanh toán được. Vui lòng thử lại.'));
    } finally {
      this.paying.set(false);
    }
  }
}
