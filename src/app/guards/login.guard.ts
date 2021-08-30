import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AccountService } from '../services/account.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate, CanLoad {
  constructor(private router: Router, private accountService: AccountService) {}

  canActivate(): Observable<boolean> {
    return this.checkForLoggedInUser();
  }

  canLoad(): Observable<boolean> {
    return this.checkForLoggedInUser();
  }

  private checkForLoggedInUser(): Observable<boolean> {
    return this.accountService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          return of(true);
        }

        return from(this.router.navigate(['/login'])).pipe(map(() => false));
      })
    );
  }
}
