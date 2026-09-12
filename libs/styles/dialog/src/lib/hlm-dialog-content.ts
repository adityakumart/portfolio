import type { ComponentType } from '@angular/cdk/portal';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	TemplateRef,
} from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';

import { classes } from '@spartan-ng/hel/utils';

type HlmDialogContentContext = {
	$component?: ComponentType<unknown> | TemplateRef<unknown>;
	$dynamicComponentClass?: string;
};

@Component({
	selector: 'hlm-dialog-content',
	imports: [NgComponentOutlet, NgTemplateOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'data-slot': 'dialog-content',
		'[attr.data-state]': 'state()',
	},
	template: `
		@if (isTemplateRef(component)) {
			<ng-container [ngTemplateOutlet]="component" [ngTemplateOutletContext]="_templateContext" />
		} @else if (component) {
			<ng-container [ngComponentOutlet]="component" />
		} @else {
			<ng-content />
		}
	`,
})
export class HlmDialogContent {
	private readonly _dialogRef = inject(BrnDialogRef);
	private readonly _dialogContext = injectBrnDialogContext<HlmDialogContentContext | null>({ optional: true });

	public readonly component = this._dialogContext?.$component;
	private readonly _dynamicComponentClass = this._dialogContext?.$dynamicComponentClass;

	protected isTemplateRef(value: unknown): value is TemplateRef<unknown> {
		return value instanceof TemplateRef;
	}

	public readonly state = computed(() => this._dialogRef?.state() ?? 'closed');

	protected readonly _templateContext = {
		$implicit: this._dialogContext,
		context: this._dialogContext,
		dialogRef: this._dialogRef,
		close: (result?: unknown) => this._dialogRef.close(result),
	};

	constructor() {
		classes(() => [
			'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 max-w-[calc(100%-2rem)] rounded-xl p-4 text-xs/relaxed ring-1 duration-100 relative mx-auto w-full outline-none sm:mx-0',
			this._dynamicComponentClass?.includes('flex') ? 'flex flex-col' : 'grid gap-4',
			this._dynamicComponentClass?.includes('max-w-') ? '' : 'sm:max-w-sm',
			this._dynamicComponentClass,
		]);
	}
}
