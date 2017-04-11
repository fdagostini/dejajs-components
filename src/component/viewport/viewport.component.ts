/*
 * *
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 * /
 *
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, HostBinding, Input, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { IViewPort, IViewPortItem, ViewportDirection, ViewportMode, ViewPortService } from '../../common/core/item-list';

export enum DejaViewPortScrollStyle {
    scrollbar,
    buttons,
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ViewPortService],
    selector: 'deja-viewport',
    styleUrls: ['./viewport.component.scss'],
    templateUrl: './viewport.component.html',
})
export class DejaViewPortComponent implements OnDestroy,
    AfterViewInit {

    protected beforeSize: string;
    protected afterSize: string;
    protected vpItems: IDejaViewPortItem[];
    protected vpStartIndex: number;
    protected vpEndIndex: number;
    protected startOffset: number;  // Buttons mode only
    @HostBinding('attr.hasUpBtn') protected hasUpButton = false;
    @HostBinding('attr.hasDownBtn') protected hasDownButton = false;
    @HostBinding('attr.horizontal') protected isHorizontal = false;
    @HostBinding('attr.buttons') protected hasButtons = false;

    private _items: IDejaViewPortItem[];
    private element: HTMLElement;
    private subscriptions: Subscription[] = [];
    private hasButtons$ = new BehaviorSubject<boolean>(false);
    private buttonsStep = 20;
    private mouseDown$Sub: Subscription;
    private mouseWheel$Sub: Subscription;
    private scrollPosition = 0;

    /** Permet de définir un template d'élément par binding */
    @Input() public itemTemplateExternal;

    @ContentChild('itemTemplate') private itemTemplateInternal;
    @ViewChild('wrapper') private wrapperElement: ElementRef;
    @ViewChild('down') private downButton: ElementRef;
    @ViewChild('up') private upButton: ElementRef;

    /** Set the list of items to render inside the viewport control */
    @Input()
    public set items(items: any[]) {
        this._items = items ? items.map((item) => ({
            model: item,
        } as IDejaViewPortItem)) : [];
        if (this.viewPort.mode === ViewportMode.disabled) {
            this.vpItems = this._items;
        }
        this.viewPort.items$.next(this._items);
    }

    /** Set the scrolling style
      * scrollbar: Classic scrollbars
      * buttons: A button before is placed at the top or at the left of the list, and a button after is placed at the right or the bottom of the list.
      */
    @Input()
    public set scrollingStyle(value: DejaViewPortScrollStyle | string) {
        const scrollingStyle = typeof value === 'string' ? DejaViewPortScrollStyle[value] : value;
        this.hasButtons$.next(scrollingStyle === DejaViewPortScrollStyle.buttons);
    }

    /** Set the direction of the items rendering
     * vertical: The item are displayed vertically
     * horizontal: The item are displayed horizontally
     */
    @Input()
    public set direction(value: ViewportDirection | string) {
        const direction = typeof value === 'string' ? ViewportDirection[value] : value;
        this.viewPort.direction$.next(direction);
        this.isHorizontal = direction === ViewportDirection.horizontal;
        this.changeDetectorRef.markForCheck();
    }

    /** Set the item size in fixed mode or the default item size before rendering in auto mode */
    @Input()
    public set itemSize(value: number | string) {
        if (value) {
            this.viewPort.itemsSize$.next(+value);
        }
    }

    public get itemSize() {
        return this.viewPort.itemsSize;
    }

    private get itemTemplate() { return this.itemTemplateExternal || this.itemTemplateInternal; }

    private get clientSize() {
        if (!this.element) {
            return 0;
        }
        return this.isHorizontal ? this.element.clientWidth : this.element.clientHeight;
    }

    private set scrollPos(value: number) {
        const scrollPos = Math.max(value, 0);
        this.scrollPosition = scrollPos;
        this.viewPort.scrollPosition$.next(scrollPos);
    }

    private get scrollPos() {
        return this.scrollPosition;
    }

    /**
     * Définit la méthode de calcul de la taille des éléments. Les valuers acceptées sont
     * disabled: Tous les éléments sont rendus. (< 100 éléments)
     * fixed: Seul les éléments visibles sont rendus. La taille des éléments est constante et définie par itemsSize. (performances ++)
     * variable: Seul les éléments visibles sont rendus. La taille des éléments est variable et définie par item.size. (performances +-)
     * auto: Seul les éléments visibles sont rendus. La taille des éléments est calculée automatiquement (performances --)
     */
    @Input()
    public set viewportMode(mode: ViewportMode | string) {
        this.viewPort.mode$.next(mode);
    }

    public get viewportMode() {
        return this.viewPort.mode;
    }

    constructor(private changeDetectorRef: ChangeDetectorRef, private viewPort: ViewPortService) {
        this.subscriptions.push(Observable
            .fromEvent(window, 'resize')
            .debounceTime(5)
            .subscribe(() => {
                if (viewPort.mode !== ViewportMode.disabled) {
                    viewPort.refresh();
                }
            }));

        this.subscriptions.push(viewPort.viewPort$
            .do((viewPortResult: IViewPort) => {
                if (viewPort.mode !== ViewportMode.disabled) {
                    this.vpItems = viewPortResult.visibleItems as IDejaViewPortItem[];
                    this.vpStartIndex = viewPortResult.startIndex;
                    this.vpEndIndex = viewPortResult.endIndex;
                } else {
                    this.vpStartIndex = 0;
                    this.vpEndIndex = 0;
                }

                if (this.hasButtons) {
                    this.startOffset = this.scrollPos - viewPortResult.beforeSize;
                    this.beforeSize = null;
                    this.afterSize = null;
                    this.hasUpButton = this.scrollPos > 0;
                    this.hasDownButton = this.scrollPos + viewPortResult.listSize < viewPortResult.beforeSize + viewPortResult.viewPortSize + viewPortResult.afterSize;

                } else {
                    this.startOffset = 0;
                    this.beforeSize = viewPortResult.beforeSize ? `${viewPortResult.beforeSize}px` : null;
                    this.afterSize = viewPortResult.afterSize ? `${viewPortResult.afterSize}px` : null;
                    this.hasUpButton = false;
                    this.hasDownButton = false;
                }
                this.changeDetectorRef.markForCheck();
            })
            .delay(1)
            .subscribe((viewPortResult: IViewPort) => {
                if (viewPortResult.scrollPos !== undefined) {
                    if (this.hasButtons) {
                        this.scrollPos = viewPortResult.scrollPos;
                    } else if (this.isHorizontal) {
                        this.element.scrollLeft = viewPortResult.scrollPos;
                    } else {
                        this.element.scrollTop = viewPortResult.scrollPos;
                    }
                    this.changeDetectorRef.markForCheck();
                }
            }));

        this.subscriptions.push(Observable.from(this.hasButtons$)
            .distinctUntilChanged()
            .do((value) => this.hasButtons = value)
            .delay(1)
            .do((value) => {
                if (value) {
                    const mousedown$ = Observable.merge(
                        Observable.fromEvent(this.downButton.nativeElement, 'mousedown'),
                        Observable.fromEvent(this.upButton.nativeElement, 'mousedown'));

                    const mouseup$ = Observable.merge(
                        Observable.fromEvent(this.downButton.nativeElement, 'mouseup'),
                        Observable.fromEvent(this.upButton.nativeElement, 'mouseup'),
                        Observable.fromEvent(this.downButton.nativeElement, 'mouseleave'),
                        Observable.fromEvent(this.upButton.nativeElement, 'mouseleave'));

                    this.mouseDown$Sub = mousedown$.subscribe((event: MouseEvent) => {
                        const target = event.currentTarget as HTMLElement;
                        const direction = target.id === 'up' ? -1 : +1;

                        mouseup$.first()
                            .subscribe((upEvent: MouseEvent) => {
                                this.scrollPos += direction * (upEvent.ctrlKey ? this.clientSize : this.buttonsStep);
                            });

                        Observable.timer(750)
                            .takeUntil(mouseup$)
                            .subscribe(() => {
                                Observable.interval(50)
                                    .takeUntil(mouseup$)
                                    .subscribe(() => {
                                        this.scrollPos += direction * (event.ctrlKey ? this.clientSize : this.buttonsStep * 2);
                                    });
                            });
                    });

                    this.mouseWheel$Sub = Observable
                        .fromEvent(this.element, 'mousewheel')
                        .subscribe((event: MouseWheelEvent) => {
                            this.scrollPos = this.scrollPos + event.deltaY;
                        });

                } else {
                    if (this.mouseDown$Sub) {
                        this.mouseDown$Sub.unsubscribe();
                        delete this.mouseDown$Sub;
                    }
                    if (this.mouseWheel$Sub) {
                        this.mouseWheel$Sub.unsubscribe();
                        delete this.mouseWheel$Sub;
                    }
                }

                this.scrollPos = 0;
            })
            .delay(1)
            .subscribe(() => this.viewPort.refresh()));
    }

    public ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        if (this.mouseDown$Sub) {
            this.mouseDown$Sub.unsubscribe();
        }
        if (this.mouseWheel$Sub) {
            this.mouseWheel$Sub.unsubscribe();
        }
    }

    public ngAfterViewInit() {
        this.element = this.wrapperElement.nativeElement as HTMLElement;

        this.subscriptions.push(Observable.fromEvent(this.element, 'scroll')
            .map((event: Event) => event.target as HTMLElement)
            .map((target) => Math.round(this.isHorizontal ? target.scrollLeft : target.scrollTop))
            .subscribe((scrollPos) => this.viewPort.scrollPosition$.next(scrollPos)));

        this.viewPort.element$.next(this.wrapperElement.nativeElement);
    }

    public refresh() {
        this.changeDetectorRef.markForCheck();
    }

    public ensureVisible(item: any) {
        this.viewPort.ensureItem$.next(item);
    }

    protected getItemSize(item: IViewPortItem) {
        if (this.viewPort.mode === ViewportMode.disabled) {
            return null;
        } else if (this.viewPort.mode === ViewportMode.fixed) {
            return this.itemSize;
        } else if (this.viewPort.mode === ViewportMode.auto) {
            return item.size || null;
        } else {
            return (item.size && item.size > ViewPortService.itemDefaultSize) ? item.size : this.itemSize;
        }
    }
}

export interface IDejaViewPortItem extends IViewPortItem {
    model: any;
}
