import * as React from 'react';
import {
    Switch as AriaSwitch,
    SwitchProps as AriaSwitchProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';

const switchVariants = cva(
    'group inline-flex items-center gap-2 font-sans text-sm font-medium antialiased transition-colors focus-visible:outline-none disabled:cursor-not-allowed',
    {
        variants: {
            size: {
                sm: 'text-[14px]',
                md: 'text-[16px]',
                lg: 'text-[18px]',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
);

const trackVariants = cva(
    'relative inline-flex shrink-0 items-center justify-start rounded-full border-2 transition-all duration-200 outline-none select-none',
    {
        variants: {
            size: {
                sm: 'h-6 w-12',
                md: 'h-7 w-14',
                lg: 'h-9 w-16',
            },
            isSelected: {
                false: 'border-gray-700 bg-transparent group-hover:border-gray-800 group-active:border-gray-900',
                true: 'border-transparent bg-blue-800 group-hover:bg-blue-900 group-active:bg-blue-1000',
            },
            isDisabled: {
                true: 'opacity-50 cursor-not-allowed',
            },
            isFocusVisible: {
                true: 'ring-2 ring-fg-border-focus ring-offset-2',
            },
        },
        compoundVariants: [
            {
                isSelected: false,
                isDisabled: true,
                className: 'bg-gray-alpha-200 border-gray-alpha-400',
            },
            {
                isSelected: true,
                isDisabled: true,
                className: 'bg-blue-400',
            },
        ],
        defaultVariants: {
            size: 'md',
            isSelected: false,
        },
    }
);

const handleVariants = cva(
    'absolute rounded-full transition-all duration-200 ease-in-out',
    {
        variants: {
            size: {
                sm: 'left-[3px] shadow-sm',
                md: 'left-[3px] shadow-sm',
                lg: 'left-[4px] shadow-sm',
            },
            isSelected: {
                false: '',
                true: '',
            },
            isDisabled: {
                true: '',
            },
        },
        compoundVariants: [
            // Size: SM
            {
                size: 'sm',
                isSelected: false,
                className: 'h-[14px] w-[14px] top-[3px]',
            },
            {
                size: 'sm',
                isSelected: true,
                className: 'h-[16px] w-[16px] top-[2px] translate-x-[23px]',
            },
            // Size: MD
            {
                size: 'md',
                isSelected: false,
                className: 'h-[18px] w-[18px] top-[3px]',
            },
            {
                size: 'md',
                isSelected: true,
                className: 'h-[20px] w-[20px] top-[2px] translate-x-[27px]',
            },
            // Size: LG
            {
                size: 'lg',
                isSelected: false,
                className: 'h-[24px] w-[24px] top-[4px]',
            },
            {
                size: 'lg',
                isSelected: true,
                className: 'h-[28px] w-[28px] top-[2px] translate-x-[26px]',
            },
            // Colors
            {
                isSelected: false,
                isDisabled: false,
                className: 'bg-gray-800 group-hover:bg-gray-900',
            },
            {
                isSelected: true,
                className: 'bg-white',
            },
            {
                isDisabled: true,
                isSelected: false,
                className: 'bg-gray-alpha-500',
            },
            {
                isDisabled: true,
                isSelected: true,
                className: 'bg-gray-100',
            },
        ],
        defaultVariants: {
            size: 'md',
            isSelected: false,
        },
    }
);

export interface SwitchProps
    extends Omit<AriaSwitchProps, 'className' | 'style' | 'children'>,
    VariantProps<typeof switchVariants> {
    children?: React.ReactNode;
}

export function Switch({
    size,
    children,
    ...props
}: SwitchProps) {
    return (
        <AriaSwitch
            {...props}
            className={({ isDisabled }) =>
                switchVariants({ size, className: isDisabled ? 'text-fg-text-disabled-disabled' : 'text-fg-text-default-default' })
            }
        >
            {(state) => (
                <>
                    <div
                        className={trackVariants({
                            size,
                            isSelected: state.isSelected,
                            isDisabled: state.isDisabled,
                            isFocusVisible: state.isFocusVisible,
                        })}
                    >
                        <span
                            className={handleVariants({
                                size,
                                isSelected: state.isSelected,
                                isDisabled: state.isDisabled,
                            })}
                        />
                    </div>
                    {children}
                </>
            )}
        </AriaSwitch>
    );
}
