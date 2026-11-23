import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';
import { AppShell } from './app/layout/app-shell';

bootstrapApplication(AppShell, {
  providers: [
    provideHttpClient(),
    provideRouter(routes, withHashLocation(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
  ],
}).catch((error: unknown) => console.error(error));
