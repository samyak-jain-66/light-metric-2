import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CountryModalComponent } from './pages/country-modal/country-modal.component';
import { debounceTime, fromEvent, map, Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'light-metric';
  logo: string = './assets/logo.png';
  getAllCountry: any = [];
  intitialCOuntryDisplay: any = [];
  searchSub!: Subscription;
  searchCountry: string = '';
  searchDisplay: any = [];
  isLoading: boolean = false;

  @ViewChild('searchBox', { read: ElementRef }) searchBox!: ElementRef;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit() {
    this.getCountry();
  }

  async getCountry() {
    const get$ = this.http.get('https://restcountries.com/v3.1/all');
    const res = await lastValueFrom(get$);
    console.log(res);
    if (res) {
      this.getAllCountry = res;
      this.getAllCountry.sort((a: any, b: any) =>
        a.name.common.localeCompare(b.name.common)
      );
      console.log(this.getAllCountry);
      for (let i = 0; i < 8; i++) {
        this.intitialCOuntryDisplay.push(this.getAllCountry[i]);
      }
    }
  }
  addMore() {
    let initialLength = this.intitialCOuntryDisplay.length;
    for (
      let i = this.intitialCOuntryDisplay.length;
      i < initialLength + 20 &&
      this.intitialCOuntryDisplay.length < this.getAllCountry.length;
      i++
    ) {
      this.intitialCOuntryDisplay.push(this.getAllCountry[i]);
    }
  }

  countryView(countryData: any) {
    // const currency =
    //   countryData.currency[Object.keys(countryData.currencies)?.[0]];
    // const language = Object.keys(countryData.languages)?.[0];
    const dialogRef = this.dialog.open(CountryModalComponent, {
      data: {
        countryData: countryData,
        // currency: currency,
        // language: language,
      },
      width: '420px',
      height: '400px',
    });
  }

  ngAfterViewInit(): void {
    this.handleKeyUp();
  }
  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  handleKeyUp() {
    this.searchSub = fromEvent(this.searchBox.nativeElement, 'keyup')
      .pipe(
        debounceTime(800),
        map((res: any) => res.target.value.trim())
      )
      .subscribe(async (res) => {
        if (res && res.length >= 1) {
          this.isLoading = true;
          this.handleSearch(res);
        } else {
          if (res.length < 1) {
            this.searchDisplay.splice(0);
            this.intitialCOuntryDisplay.splice(0);
            this.getCountry();
          }
        }
      });
  }
  async handleSearch(searchValue: any) {
    if (this.searchDisplay.length > 0) {
      this.searchDisplay.splice(0);
    }
    const get$ = this.http.get(
      `https://restcountries.com/v3.1/name/${searchValue}`
    );
    const res = await lastValueFrom(get$);
    if (res) {
      console.log(res);
      this.isLoading = false;
      this.searchDisplay = res;
      this.searchDisplay.sort((a: any, b: any) =>
        a.name.common.localeCompare(b.name.common)
      );
    }
  }
}
