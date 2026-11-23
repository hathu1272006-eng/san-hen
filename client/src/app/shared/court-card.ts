import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Court, money, sportLabel } from '../core/models';

@Component({
  selector: 'app-court-card',
  imports: [RouterLink],
  template: `
    <article class="court-card">
      <a class="card-image" [routerLink]="['/san', court().slug]" [attr.aria-label]="'Xem ' + court().name">
        <img [src]="'images/' + court().image" [alt]="court().alt" width="640" height="400" loading="lazy">
        <span class="sport-label">{{ sportLabel(court().sport) }}</span>
      </a>
      <div class="card-body">
        <p class="card-area"><span class="pin" aria-hidden="true"></span>{{ court().area }}</p>
        <h3><a [routerLink]="['/san', court().slug]">{{ court().name }}</a></h3>
        <p class="card-summary">{{ court().summary }}</p>
        <div class="card-footer">
          <span class="price">{{ money(court().price) }} <small>/ giờ</small></span>
          <a class="text-link" [routerLink]="['/san', court().slug]">Xem giờ</a>
        </div>
      </div>
    </article>
  `,
})
export class CourtCard {
  readonly court = input.required<Court>();
  readonly money = money;
  readonly sportLabel = sportLabel;
}
