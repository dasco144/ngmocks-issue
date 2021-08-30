import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MyPlaylistsComponent } from './my-playlists.component';

@NgModule({
  declarations: [MyPlaylistsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: MyPlaylistsComponent }])
  ]
})
export class MyPlaylistsModule {}
