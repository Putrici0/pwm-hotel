import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title-subtitle',
  standalone: true,
  templateUrl: './title-subtitle.component.html',
  styleUrl: './title-subtitle.component.css'
})
export class TitleSubtitleComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
