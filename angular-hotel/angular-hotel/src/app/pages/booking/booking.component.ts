import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { BookingsService } from '../../services/bookings.service';
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
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bookingsService = inject(BookingsService);
  private readonly siteDataService = inject(SiteDataService);
  private readonly roomImageKeys: Record<string, string> = {
    'suite-mar': 'initialdata-rooms-item-1-suite-mar-premium',
    'deluxe-terr': 'initialdata-rooms-item-2-habitacion-deluxe-terraza',
    familiar: 'initialdata-rooms-item-3-habitacion-familiar',
    cozy: 'initialdata-rooms-item-4-habitacion-cozy'
  };

  heroImage =
    'https://st2.depositphotos.com/4695029/7141/i/600/depositphotos_71419053-stock-photo-beautiful-swimming-pool.jpg';

  availableRooms: RoomOption[] = [
    {
      id: 'suite-mar',
      name: 'Suite Mar Premium',
      maxGuests: 2,
      img: 'https://st2.depositphotos.com/4142621/6549/i/600/depositphotos_65494105-stock-photo-luxury-hotel-room.jpg'
    },
    {
      id: 'deluxe-terr',
      name: 'Habitación Deluxe Terraza',
      maxGuests: 4,
      img: 'https://st2.depositphotos.com/1000441/6460/i/600/depositphotos_64609101-stock-photo-large-terrace-with-loungers.jpg'
    },
    {
      id: 'familiar',
      name: 'Habitación Familiar',
      maxGuests: 6,
      img: 'https://st3.depositphotos.com/1016811/17863/i/600/depositphotos_178638268-stock-photo-triple-beds-in-a-luxury.jpg'
    },
    {
      id: 'cozy',
      name: 'Habitación Cozy',
      maxGuests: 2,
      img: 'https://st4.depositphotos.com/12985790/22759/i/600/depositphotos_227591792-stock-photo-black-suitcase-travel-hotel-room.jpg'
    }
  ];

  filteredRooms: RoomOption[] = [];
  selectedRoomName = '';
  submitted = false;
  bookingDone = false;
  sending = false;
  errorMessage = '';

  readonly searchForm = this.fb.group({
    checkin: ['', Validators.required],
    checkout: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1)]],
    includeFamilySuite: [false]
  });

  readonly checkoutForm = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    privacy: [false, Validators.requiredTrue]
  });

  constructor() {
    this.siteDataService.getImageCatalog()
      .pipe(takeUntilDestroyed())
      .subscribe((catalog) => {
        this.heroImage = this.siteDataService.resolveImage(
          catalog,
          'booking-header-reserva-tu-estancia-en-isla-dorada',
          this.heroImage
        );

        this.availableRooms = this.availableRooms.map((room) => ({
          ...room,
          img: this.siteDataService.resolveImage(catalog, this.roomImageKeys[room.id], room.img)
        }));

        if (this.filteredRooms.length) {
          this.filteredRooms = this.filteredRooms.map((room) => ({
            ...room,
            img: this.siteDataService.resolveImage(catalog, this.roomImageKeys[room.id], room.img)
          }));
        }
      });
  }

  searchAvailability(): void {
    const guests = Number(this.searchForm.value.guests || 0);
    this.filteredRooms = this.availableRooms.filter((room) => room.maxGuests >= guests);
    this.selectedRoomName = '';
    this.submitted = true;
    this.bookingDone = false;
    this.errorMessage = '';
  }

  selectRoom(room: RoomOption): void {
    this.selectedRoomName = room.name;
    this.bookingDone = false;
  }

  async confirmBooking(): Promise<void> {
    if (!this.selectedRoomName) {
      this.errorMessage = 'Selecciona una habitación antes de confirmar.';
      return;
    }

    if (this.checkoutForm.invalid || this.searchForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.searchForm.markAllAsTouched();
      this.errorMessage = 'Revisa los datos del formulario.';
      return;
    }

    this.sending = true;
    this.errorMessage = '';

    try {
      await this.bookingsService.createBooking({
        name: this.checkoutForm.value.name || '',
        lastName: this.checkoutForm.value.lastName || '',
        email: this.checkoutForm.value.email || '',
        checkin: this.searchForm.value.checkin || '',
        checkout: this.searchForm.value.checkout || '',
        guests: Number(this.searchForm.value.guests || 0),
        roomName: this.selectedRoomName,
        familySuite: !!this.searchForm.value.includeFamilySuite,
        createdAt: new Date().toISOString()
      });

      this.bookingDone = true;
    } catch (error) {
      console.error(error);
      this.errorMessage = 'No se pudo guardar la reserva.';
    } finally {
      this.sending = false;
    }
  }

  get summaryCheckin(): string {
    return this.formatSummaryDate(this.searchForm.value.checkin || '');
  }

  get summaryCheckout(): string {
    return this.formatSummaryDate(this.searchForm.value.checkout || '');
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
