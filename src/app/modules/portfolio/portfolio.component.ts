import { Component, OnDestroy, signal, inject, OnInit, computed } from '@angular/core';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatGridListModule } from '@angular/material/grid-list';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { interval, merge, of, Subject } from 'rxjs';
import { concatMap, finalize, map, takeUntil, takeWhile, tap } from 'rxjs/operators';

import { GlobalData } from 'src/shared/data/GlobalData';
import { MatExpansionModule } from '@angular/material/expansion';


@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.scss'],
    imports: [
        PortfolioRoutingModule,
        MatCardModule,
        MatChipsModule,
        MatTooltipModule,
        MatGridListModule,
        MatExpansionModule
    ],
    providers: [GlobalData]
})
export class PortfolioComponent implements OnDestroy, OnInit {
    destroyed = new Subject<void>();
    columnsMap = new Map([
        // [Breakpoints.XSmall, 1],
        // [Breakpoints.Small, 2],
        // [Breakpoints.Medium, 3],
        // [Breakpoints.Large, 4],
        // [Breakpoints.XLarge, 5],
        [Breakpoints.XSmall, 1],
        [Breakpoints.Small, 2],
        [Breakpoints.Medium, 2],
        [Breakpoints.Large, 2],
        [Breakpoints.XLarge, 2],
    ]);

    constructor(private globalData: GlobalData) {
        inject(BreakpointObserver)
            .observe([
                Breakpoints.XSmall,
                Breakpoints.Small,
                Breakpoints.Medium,
                Breakpoints.Large,
                Breakpoints.XLarge,
            ])
            .pipe(takeUntil(this.destroyed))
            .subscribe(result => {
                for (const query of Object.keys(result.breakpoints)) {
                    if (result.breakpoints[query]) {
                        this.gridColumns.set(this.columnsMap.get(query) ?? 1);
                    }
                }
            });
    }
    ngOnInit(): void {
        this.typewriterEffect(this.resume().basics.jobtitle)
    }

    gridColumns = signal(1);

    resume = signal(this.globalData.resume);
    classNameForJobTitle = computed(() => {
        switch (true) {
            case (this.jobtitle().length % 10 === 0):
                return 'purple';
            case (this.jobtitle().length % 9 === 0):
                return 'grey';
            case (this.jobtitle().length % 8 === 0):
                return 'darkGrey';
            case (this.jobtitle().length % 7 === 0):
                return 'darkBlue';
            case (this.jobtitle().length % 6 === 0):
                return 'brown';
            case (this.jobtitle().length % 5 === 0):
                return 'orange';
            case (this.jobtitle().length % 4 === 0):
                return 'green';
            case (this.jobtitle().length % 3 === 0):
                return 'skyblue';
            case (this.jobtitle().length % 2 === 0):
                return 'blue';
            case (this.jobtitle().length % 1 === 0):
                return 'red'
            default:
                return ''

        }
    })

    jobtitle = signal("");

    openInNewTab = (url: string) => {
        if (url) {
            window.open(url);
        }
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }

    typewriterEffect(text: string) {
        const textArray = text.split('');
        const interval$ = interval(100);

        interval$
            .pipe(
                takeWhile(index => index < textArray.length),
                finalize(() => this.resetTypewriter(textArray))
            )
            .subscribe((index) => {
                this.jobtitle.update(char => char + textArray[index]);
            });
    }

    resetTypewriter(textArray: string[]) {
        setTimeout(() => {
            this.jobtitle.update(() => '');
            this.typewriterEffect(this.resume().basics.jobtitle);
        }, 2000); // reset after two seconds
    }

}
