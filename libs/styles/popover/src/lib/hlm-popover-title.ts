import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/hel/utils';

@Directive({
	selector: '[hlmPopoverTitle]',
	host: { 'data-slot': 'popover-title' },
})
export class HlmPopoverTitle {
	constructor() {
		classes(() => 'text-sm font-medium');
	}
}
