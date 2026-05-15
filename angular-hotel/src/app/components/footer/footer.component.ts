import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonCol, IonFooter, IonGrid, IonRow, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IonFooter, IonGrid, IonRow, IonCol, IonText],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {}
