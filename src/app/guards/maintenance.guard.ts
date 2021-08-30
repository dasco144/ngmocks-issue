import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AccountService } from '../services/account.service';

@Injectable({
    providedIn: 'root'
})
export class MaintenanceGuard implements CanLoad, CanActivate {
    constructor(
        private accountService: AccountService,
        private router: Router
    ) {}

    canLoad(): Observable<boolean> {
        return this.checkForMaintenancePermission();
    }

    canActivate(): Observable<boolean> {
        return this.checkForMaintenancePermission();
    }

    private checkForMaintenancePermission(): Observable<boolean> {
        return this.accountService.currentUser$.pipe(
            switchMap((user) => {
                const hasMaintenance =
                    user?.permissions?.includes('Maintenance') ?? false;

                if (hasMaintenance) {
                    return of(true);
                }

                return from(this.router.navigate(['/app/my-playlists'])).pipe(
                    map(() => false)
                );
            })
        );
    }
}
