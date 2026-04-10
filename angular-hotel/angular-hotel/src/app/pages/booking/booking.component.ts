import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TitleSubtitleComponent } from '../../components/title-subtitle/title-subtitle.component';
import { SiteDataService } from '../../services/site-data.service';

interface RoomOption {
  id: string;
  name: string;
  maxGuests: number;
  img: string;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, TitleSubtitleComponent],
  templateUrl: './booking.component.html'
})
export class BookingComponent implements OnInit {
  private readonly siteDataService = inject(SiteDataService);
  readonly bookingData$ = this.siteDataService.getSection<any>('booking');

  readonly availableRooms: RoomOption[] = [
    { id: 'suite-mar', name: 'Suite Mar Premium', maxGuests: 2, img: '/img/bookingRooms/11.jpg' },
    { id: 'deluxe-terr', name: 'Habitacion Deluxe Terraza', maxGuests: 4, img: '/img/bookingRooms/12.jpg' },
    { id: 'familiar', name: 'Habitacion Familiar', maxGuests: 6, img: '/img/bookingRooms/13.jpg' },
    { id: 'cozy', name: 'Habitacion Cozy', maxGuests: 2, img: '/img/bookingRooms/14.jpg' }
  ];

  checkin = '';
  checkout = '';
  guests = 2;
  includeFamilySuite = false;

  filteredRooms: RoomOption[] = [];
  selectedRoomName = '';
  submitted = false;
  bookingDone = false;
  formModel = {
    name: '',
    lastName: '',
    email: '',
    privacy: false
  };

  ngOnInit(): void {
    this.bookingData$.subscribe((data) => {
      this.checkin = data?.availability?.defaultCheckin || '';
      this.checkout = data?.availability?.defaultCheckout || '';
      this.guests = data?.availability?.defaultGuests || 2;
    });
  }

  searchAvailability(): void {
    this.filteredRooms = this.availableRooms.filter((room) => room.maxGuests >= this.guests);
    this.selectedRoomName = '';
    this.submitted = true;
    this.bookingDone = false;
  }

  selectRoom(room: RoomOption): void {
    this.selectedRoomName = room.name;
    this.bookingDone = false;
  }

  confirmBooking(): void {
    this.bookingDone = true;
  }

  get summaryCheckin(): string {
    return this.formatSummaryDate(this.checkin);
  }

  get summaryCheckout(): string {
    return this.formatSummaryDate(this.checkout);
  }

  private formatSummaryDate(rawDate: string): string {
    if (!rawDate) {
      return '--/--/----';
    }
    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return rawDate;
    }
    return new Intl.DateTimeFormat('es-ES').format(parsedDate);
  }
}
