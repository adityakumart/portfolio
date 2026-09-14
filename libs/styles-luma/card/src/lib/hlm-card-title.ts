import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/hel-luma/utils';

@Directive({
	selector: '[hlmCardTitle]',
	host: { 'data-slot': 'card-title' },
})
export class HlmCardTitle {
	constructor() {
		classes(() => 'text-base font-medium');
	}
}
