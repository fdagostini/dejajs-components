import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DejaMarkdownModule } from '../../component/markdown/index';
import { HomeComponent } from './home.component';
import { routing } from './home.routes';

@NgModule({
    declarations: [HomeComponent],
    exports: [HomeComponent],
    imports: [
        CommonModule,
        DejaMarkdownModule,
        routing,
    ],
    providers: [
    ],
})
export class HomeModule { }
