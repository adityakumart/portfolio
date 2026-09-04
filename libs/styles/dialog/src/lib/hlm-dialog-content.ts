import type { BooleanInput } from '@angular/cdk/coercion';
import type { ComponentType } from '@angular/cdk/portal';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	TemplateRef,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/hel/button';

import { classes } from '@spartan-ng/hel/utils';
import { HlmDialogClose } from './hlm-dialog-close';

type HlmDialogContentContext = {
	$component?: ComponentType<unknown> | TemplateRef<unknown>;
	$dynamicComponentClass?: string;
	$showCloseButton?: boolean;
};

@Component({
	selector: 'hlm-dialog-content',
	imports: [NgComponentOutlet, NgTemplateOutlet, HlmButton, HlmDialogClose, NgIcon],
	providers: [provideIcons({ lucideX })],
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

		@if (showCloseButton()) {
			<button hlmBtn variant="ghost" size="icon-sm" class="absolute end-2 top-2" hlmDialogClose>
				<span class="sr-only">close</span>
				<ng-icon name="lucideX" />
			</button>
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

	public readonly showCloseButton = input<boolean, BooleanInput>(
		this._dialogContext?.$showCloseButton ?? !this.isTemplateRef(this.component),
		{
			transform: booleanAttribute,
		},
	);

	public readonly state = computed(() => this._dialogRef?.state() ?? 'closed');

	protected readonly _templateContext = {
		$implicit: this._dialogContext,
		context: this._dialogContext,
		dialogRef: this._dialogRef,
		close: (result?: unknown) => this._dialogRef.close(result),
	};

	constructor() {
		classes(() => [
			'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-xl p-4 text-sm ring-1 duration-100 relative mx-auto w-full outline-none sm:mx-0',
			this._dynamicComponentClass?.includes('max-w-') ? '' : 'sm:max-w-sm',
			this._dynamicComponentClass,
		]);
	}
}
