import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Sân Hẹn · Tìm sân, hẹn bạn', loadComponent: () => import('./features/home/home.page').then(m => m.HomePage) },
  { path: 'san', title: 'Tìm sân · Sân Hẹn', loadComponent: () => import('./features/catalog/catalog.page').then(m => m.CatalogPage) },
  { path: 'san/:slug', title: 'Chi tiết sân · Sân Hẹn', loadComponent: () => import('./features/court/court.page').then(m => m.CourtPage) },
  { path: 'lich-cua-toi', title: 'Lịch của tôi · Sân Hẹn', loadComponent: () => import('./features/bookings/bookings.page').then(m => m.BookingsPage) },
  { path: 'thanh-toan/:code', title: 'Thanh toán · Sân Hẹn', loadComponent: () => import('./features/payment/payment.page').then(m => m.PaymentPage) },
  { path: '**', redirectTo: '' },
];
