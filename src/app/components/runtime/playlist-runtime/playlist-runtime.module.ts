import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlaylistRuntimeComponent } from './playlist-runtime.component';

@NgModule({
    declarations: [PlaylistRuntimeComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: PlaylistRuntimeComponent
            }
        ]),
    ]
})
export class PlaylistRuntimeModule {}
