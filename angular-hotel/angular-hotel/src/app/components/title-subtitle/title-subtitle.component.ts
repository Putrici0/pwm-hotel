import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title-subtitle',
  standalone: true,
  templateUrl: './title-subtitle.component.html'
})
export class TitleSubtitleComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
