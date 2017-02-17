/*
 * *
 *  @license
 *  Copyright Hôpital Universitaire de Genève All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/deja-js/blob/master/LICENSE
 * /
 *
 */

/**
 * Created by rtr on 22.12.2016.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SplitAreaDirective } from "./split-area.directive";
import { SplitGutterDirective } from "./split-gutter.directive";
import { DejaSplitterComponent } from "./splitter.component";

@NgModule({
    declarations: [
        DejaSplitterComponent,
        SplitAreaDirective,
        SplitGutterDirective,
    ],
    exports: [
        DejaSplitterComponent,
        SplitAreaDirective,
        SplitGutterDirective,
    ],
    imports: [
        CommonModule,
    ],
})
export class DejaSplitterModule {

}
