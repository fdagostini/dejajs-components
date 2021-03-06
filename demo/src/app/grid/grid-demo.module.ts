/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatTabsModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DejaDialogModule, DejaDragDropModule, DejaGridModule, DejaMessageBoxModule, DejaSplitterModule, GroupingService } from '@deja-js/component';
import { DejaMarkdownModule } from '../../component/markdown/index';
import { DejaGridDemoComponent } from './grid-demo';
import { routing } from './grid-demo.routes';

@NgModule({
    declarations: [DejaGridDemoComponent],
    exports: [DejaGridDemoComponent],
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MatCardModule,
        MatIconModule,
        MatTabsModule,
        MatToolbarModule,
        DejaDialogModule,
        DejaDragDropModule,
        DejaGridModule,
        DejaMarkdownModule,
        DejaMessageBoxModule,
        DejaSplitterModule,
        routing,
    ],
    providers: [
        GroupingService
    ],
})
export class DejaGridDemoModule { }
