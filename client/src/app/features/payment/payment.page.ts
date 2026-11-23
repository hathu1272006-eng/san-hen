import { afterNextRender, Component, computed, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourtApi, messageFor } from '../../core/court-api';
import {
  Booking, calendarLabel, canPay, endHour, money, PaymentMethod, paymentLabel, paymentMethodLabel,
  paymentMethods, timestampLabel,
} from '../../core/models';

const steps = ['Lượt đặt', 'Phương thức', 'Xác nhận', 'Biên nhận'] as const;
type CheckoutStep = 0 | 1 | 2;

@Component({
  imports: [RouterLink],
  templateUrl: './payment.page.html',
})
export class PaymentPage {
  private readonly api = inject(CourtApi);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('stepHeading');
  private attempt = 0;
  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);
  readonly paying = signal(false);
  readonly loadError = signal('');
  readonly paymentError = signal('');
  readonly step = signal<CheckoutStep>(0);
  readonly method = signal<PaymentMethod | null>(null);
  readonly qrImage = signal('');
  readonly qrError = signal(false);
  readonly steps = steps;
  readonly methods = paymentMethods;
  readonly receipt = computed(() => {
    const payment = this.booking()?.payment;
    return payment && payment.status !== 'unpaid' ? payment : null;
  });
  readonly calendarLabel = calendarLabel;
  readonly canPay = canPay;
  readonly endHour = endHour;
  readonly money = money;
  readonly paymentLabel = paymentLabel;
  readonly paymentMethodLabel = paymentMethodLabel;
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
    this.paying.set(false);
    this.step.set(0);
    this.method.set(null);
    this.qrImage.set('');
    this.qrError.set(false);

    try {
      const booking = await this.api.booking(code);
      if (attempt === this.attempt) this.booking.set(booking);
    } catch (error) {
      if (attempt === this.attempt) this.loadError.set(messageFor(error, 'Chưa tải được thông tin thanh toán.'));
    } finally {
      if (attempt === this.attempt) this.loading.set(false);
    }
  }

  changeStep(step: CheckoutStep): void {
    if (this.paying() || (step === 2 && !this.method())) return;
    this.paymentError.set('');
    this.step.set(step);
    this.focusHeading();

    if (step === 2 && this.method() === 'bank-qr' && !this.qrImage()) void this.loadQr();
  }

  private focusHeading(): void {
    afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
  }

  private async loadQr(): Promise<void> {
    const booking = this.booking();
    if (!booking) return;
    const attempt = this.attempt;
    this.qrError.set(false);

    try {
      const { default: qrCode } = await import('qrcode');
      const image = await qrCode.toDataURL('SANHEN-DEMO|' + booking.code, { width: 192, margin: 4 });
      if (attempt === this.attempt) this.qrImage.set(image);
    } catch {
      if (attempt === this.attempt) this.qrError.set(true);
    }
  }

  async pay(): Promise<void> {
    const booking = this.booking();
    const method = this.method();
    if (!booking || !method || this.step() !== 2 || !canPay(booking) || this.paying()) return;

    const attempt = this.attempt;
    this.paying.set(true);
    this.paymentError.set('');
    try {
      const updated = await this.api.pay(booking.code, method);
      if (attempt === this.attempt) {
        this.booking.set(updated);
        this.focusHeading();
      }
    } catch (error) {
      if (attempt === this.attempt) this.paymentError.set(messageFor(error, 'Chưa thanh toán được. Vui lòng thử lại.'));
    } finally {
      if (attempt === this.attempt) this.paying.set(false);
    }
  }
}
