import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../core/environment';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <a class="skip-link" href="#main-content" (click)="skip($event)">Đến nội dung</a>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="wordmark" routerLink="/" aria-label="Sân Hẹn, trang chủ">
          <span class="brand-mark" aria-hidden="true"></span><span>Sân Hẹn<span class="brand-period">.</span></span>
        </a>
        <nav aria-label="Điều hướng chính">
          <a class="nav-home" routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page">Trang chủ</a>
          <a routerLink="/san" routerLinkActive="is-active" ariaCurrentWhenActive="page">Tìm sân</a>
          <a class="nav-bookings" routerLink="/lich-cua-toi" routerLinkActive="is-active" ariaCurrentWhenActive="page">Lịch của tôi</a>
        </nav>
      </div>
    </header>
    <main id="main-content" tabindex="-1"><router-outlet /></main>
    <footer class="site-footer">
      <div class="wrap footer-inner">
        <a class="wordmark" routerLink="/"><span class="brand-mark" aria-hidden="true"></span><span>Sân Hẹn<span class="brand-period">.</span></span></a>
        <p>{{ demo ? 'Bản trải nghiệm · Lượt đặt lưu trên trình duyệt này.' : 'Dự án minh họa · Thông tin sân là dữ liệu mẫu.' }}</p>
        <a class="text-link" routerLink="/san">Khám phá sân</a>
      </div>
    </footer>
  `,
})
export class AppShell {
  readonly demo = environment.demo;

  skip(event: Event): void {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }
}
