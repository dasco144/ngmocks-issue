import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaintenanceGuard } from '../../guards/maintenance.guard';
import { MaintenanceComponent } from './maintenance.component';

@NgModule({
  declarations: [MaintenanceComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MaintenanceComponent,
        canActivate: [MaintenanceGuard]
      }
    ])
  ]
})
export class MaintenanceModule {}
