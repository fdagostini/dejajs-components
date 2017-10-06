/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatInputModule } from '@angular/material';
import { MediaModule } from '../../common/core/media/index';
import { DejaChildValidatorModule } from '../../common/core/validation/index';
import { DejaChipsModule } from '../chips/index';
import { DejaOverlayModule } from '../overlay/index';
import { DejaItemComponent } from './../../common/core/item-list/item.component';
import { DejaSelectComponent } from './select.component';

@NgModule({
    declarations: [
        DejaSelectComponent,
        DejaItemComponent,
    ],
    exports: [
        DejaSelectComponent,
        DejaItemComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        DejaOverlayModule,
        MatIconModule,
        MatInputModule,
        DejaChildValidatorModule,
        DejaChipsModule,
        MediaModule,
    ],
})
export class DejaSelectModule { }

export * from './select.component';
