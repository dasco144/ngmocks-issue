import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  currentUser$: Observable<User>;
  currentUserSource = new ReplaySubject<User>(1);

  constructor() {
    this.currentUser$ = this.currentUserSource.asObservable();
  }
}
