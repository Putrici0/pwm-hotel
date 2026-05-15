import { Component, Input } from '@angular/core';
import { IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-title-subtitle',
  standalone: true,
  imports: [IonText],
  templateUrl: './title-subtitle.component.html',
  styleUrl: './title-subtitle.component.css'
})
export class TitleSubtitleComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
