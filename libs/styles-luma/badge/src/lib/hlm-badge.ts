import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/hel-luma/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva(
	'inline-flex items-center justify-center w-fit shrink-0 whitespace-nowrap rounded-3xl border border-transparent font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 group/badge [&>ng-icon]:pointer-events-none [&>ng-icon]:size-3.5 has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 [a]:hover:bg-primary/90',
				secondary:
					'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80 [a]:hover:bg-secondary/80',
				destructive:
					'bg-destructive/15 text-destructive border-destructive/25 hover:bg-destructive/25 dark:bg-destructive/20 dark:text-red-400 dark:border-destructive/35 [a]:hover:bg-destructive/25 focus-visible:ring-destructive/30',
				outline:
					'border-border text-foreground hover:bg-muted/60 hover:text-foreground [a]:hover:bg-muted [a]:hover:text-foreground bg-background/50 backdrop-blur-xs',
				ghost:
					'border-transparent text-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-muted/40',
				link:
					'border-transparent text-primary underline-offset-4 hover:underline hover:text-primary/80',
			},
			size: {
				default: 'px-2.5 py-0.5 text-xs font-semibold gap-1.5 leading-normal',
				sm: 'px-2 py-0.5 text-[0.6875rem] font-semibold gap-1 leading-none',
				lg: 'px-3.5 py-1 text-sm font-semibold gap-2 leading-relaxed',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

@Directive({
	selector: '[hlmBadge],hlm-badge',
	host: {
		'data-slot': 'badge',
		'[attr.data-variant]': 'variant()',
		'[attr.data-size]': 'size()',
	},
})
export class HlmBadge {
	public readonly variant = input<BadgeVariants['variant']>('default');
	public readonly size = input<BadgeVariants['size']>('default');

	constructor() {
		classes(() => badgeVariants({ variant: this.variant(), size: this.size() }));
	}
}
