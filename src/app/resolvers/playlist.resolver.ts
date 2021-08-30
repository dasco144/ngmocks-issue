import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Apollo, gql } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
    splitDashboardTypes,
    splitPlaylistTypes,
    splitWidgetTypes
} from '../helpers/model-helpers';
import { Playlist, PlaylistType } from '../models/playlist';
import { WidgetWithLinkType } from '../models/widget';
import { upsertDashboardLinks } from '../store/dashboard-link/dashboard-link.actions';
import { upsertDashboards } from '../store/dashboard/dashboard.actions';
import { upsertPlaylist } from '../store/playlist/playlist.actions';
import { upsertWidgetColumns } from '../store/widget-column/widget-column.actions';
import { upsertWidgetLinks } from '../store/widget-link/widget-link.actions';
import { upsertWidgetParameters } from '../store/widget-parameter/widget-parameter.actions';
import { upsertMultipleWidgetSeries } from '../store/widget-series/widget-series.actions';
import { upsertWidgets } from '../store/widget/widget.actions';
import { MaintenanceTab } from '../types/types';

@Injectable({
    providedIn: 'root'
})
export class PlaylistResolver implements Resolve<Playlist | null> {
    constructor(
        private messageService: MessageService,
        private router: Router,
        private apollo: Apollo,
        private store: Store
    ) {}

    // TODO find some way to navigate to either maintenance or my-playlists dependending on where we came from
    resolve(route: ActivatedRouteSnapshot): Observable<Playlist | null> {
        const playlistId = parseInt(route.params.id);
        const tab: MaintenanceTab = 'playlist';

        if (isNaN(playlistId)) {
            console.error(
                'Error while attemping to resolve playlist. The supplied playlist Id was not valid. Navigating back to maintenance',
                route.params.id
            );

            this.messageService.add({
                summary: 'Unable to retrieve playlist for execution',
                detail: 'The supplied playlist Id was not valid. Navigating back to maintenance',
                severity: 'error'
            });

            return from(
                this.router.navigate(['app/maintenance'], {
                    state: { tab }
                })
            ).pipe(map(() => null));
        }

        return this.apollo
            .query<{
                playlistQuery: { playlist: PlaylistType };
            }>({
                query: gql`
                    query GetPlaylistById($id: Int!) {
                        playlistQuery {
                            playlist(id: $id) {
                                id
                                owner
                                name
                                isActive
                                isPrivate
                                lastPlayed
                                created
                                createdBy
                                modified
                                modifiedBy
                                dashboards {
                                    id
                                    recId
                                    name
                                    owner
                                    displayTitle
                                    seqNo
                                    duration
                                    isActive
                                    isPrivate
                                    lastDisplay
                                    rowCount
                                    colCount
                                    cellSpacing
                                    created
                                    createdBy
                                    modified
                                    modifiedBy
                                    widgets {
                                        id
                                        dashboardId
                                        recId
                                        name
                                        title
                                        annotation
                                        style
                                        publicSSId
                                        refreshOnReload
                                        isActive
                                        lastViewed
                                        settings
                                        xPos
                                        yPos
                                        width
                                        height
                                        created
                                        createdBy
                                        modified
                                        modifiedBy

                                        columns {
                                            id
                                            name
                                            widgetId
                                            sqlDataType
                                            gridColNo
                                            gridVisible
                                        }

                                        parameters {
                                            id
                                            name
                                            widgetId
                                            description
                                            type
                                            order
                                            length
                                            allowNull
                                            lookupField
                                        }

                                        series {
                                            id
                                            name
                                            widgetId
                                            labelColId
                                            valueColId
                                            gaugeMinValue
                                            gaugeMinColour
                                            gaugeInterimValue1
                                            gaugeInterimColour1
                                            gaugeInterimValue2
                                            gaugeInterimColour2
                                            gaugeInterimValue3
                                            gaugeInterimColour3
                                            gaugeMaxValue
                                            gaugeMaxColour
                                        }
                                    }
                                }
                            }
                        }
                    }
                `,
                variables: { id: playlistId }
            })
            .pipe(
                switchMap((result) => {
                    if (
                        result.errors ||
                        !result.data?.playlistQuery?.playlist
                    ) {
                        this.messageService.add({
                            summary:
                                'Unable to retrieve playlist for execution',
                            detail: `The playlist for Id ${playlistId} was not found. Navigating back to maintenance`,
                            severity: 'error'
                        });

                        console.error(
                            `Error while attemping to resolve playlist. The playlist for Id ${playlistId} was not found. Navigating back to maintenance`,
                            playlistId,
                            result?.errors
                        );

                        return from(
                            this.router.navigate(['app/maintenance'], {
                                state: { tab }
                            })
                        ).pipe(map(() => null));
                    }

                    const playlist: Playlist = {

                    };

                    return of(playlist);
                }),
                catchError((error: Error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary:
                            'Unable to retrieve playlist for execution. Navigating back to maintenance',
                        detail: 'Please view the console for more details'
                    });

                    console.error(
                        'Errors occurred retrieving playlist for execution. Navigating back to maintenance',
                        playlistId,
                        error
                    );

                    return from(
                        this.router.navigate(['app/maintenance'], {
                            state: { tab }
                        })
                    ).pipe(map(() => null));
                })
            );
    }
}
