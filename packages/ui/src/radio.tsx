import * as React from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  RadioProps as AriaRadioProps,
} from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";

const radioGroupVariants = cva("inline-flex flex-col gap-[12px]");

const radioRootVariants = cva(
  "group inline-flex items-center gap-[8px] font-sans font-medium antialiased transition-colors",
  {
    variants: {
      size: {
        sm: "type-body-sm-medium",
        md: "type-body-md-medium",
      },
      isDisabled: {
        true: "cursor-not-allowed text-text-disabled-disabled",
        false: "cursor-pointer text-text-default-default",
      },
    },
    defaultVariants: {
      size: "sm",
      isDisabled: false,
    },
  },
);

const controlVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center rounded-full border-solid bg-inputs-radio-container-bg transition-colors focus-visible:outline-none",
  {
    variants: {
      size: {
        sm: "h-[16px] w-[16px]",
        md: "h-[24px] w-[24px]",
      },
      isSelected: {
        true: "",
        false: "",
      },
      isHovered: {
        true: "",
        false: "",
      },
      isPressed: {
        true: "border-[3px]",
        false: "border-2",
      },
      isDisabled: {
        true: "",
        false: "",
      },
      isFocusVisible: {
        true: "ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-raised",
        false: "",
      },
    },
    compoundVariants: [
      {
        isSelected: false,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className: "border-inputs-radio-container-off-border",
      },
      {
        isSelected: false,
        isDisabled: false,
        isHovered: true,
        isPressed: false,
        className: "border-inputs-radio-container-off-border-hover",
      },
      {
        isSelected: false,
        isDisabled: false,
        isPressed: true,
        className: "[border-color:var(--color-bg-primary-hover)]",
      },
      {
        isSelected: true,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className: "border-inputs-radio-container-selected-border",
      },
      {
        isSelected: true,
        isDisabled: false,
        isHovered: true,
        isPressed: false,
        className: "border-inputs-radio-container-selected-border-hover",
      },
      {
        isSelected: true,
        isDisabled: false,
        isPressed: true,
        className: "[border-color:var(--color-bg-primary-hover)]",
      },
      {
        isDisabled: true,
        className: "border-inputs-radio-indicator-disabled-border",
      },
    ],
    defaultVariants: {
      size: "sm",
      isSelected: false,
      isHovered: false,
      isPressed: false,
      isDisabled: false,
      isFocusVisible: false,
    },
  },
);

const indicatorVariants = cva(
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors",
  {
    variants: {
      size: {
        sm: "",
        md: "",
      },
      isPressed: {
        true: "",
        false: "",
      },
      isSelected: {
        true: "",
        false: "",
      },
      isHovered: {
        true: "",
        false: "",
      },
      isDisabled: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        size: "sm",
        isPressed: false,
        className: "h-[8px] w-[8px]",
      },
      {
        size: "sm",
        isPressed: true,
        className: "h-[6px] w-[6px]",
      },
      {
        size: "md",
        isPressed: false,
        className: "h-[14px] w-[14px]",
      },
      {
        size: "md",
        isPressed: true,
        className: "h-[12px] w-[12px]",
      },
      {
        isSelected: false,
        isDisabled: false,
        className: "bg-transparent",
      },
      {
        isSelected: false,
        isDisabled: true,
        className: "bg-transparent",
      },
      {
        isSelected: true,
        isHovered: false,
        isDisabled: false,
        className: "bg-inputs-radio-indicator-selected-bg",
      },
      {
        isSelected: true,
        isHovered: true,
        isDisabled: false,
        className: "bg-inputs-radio-indicator-selected-bg-hover",
      },
      {
        isSelected: true,
        isDisabled: true,
        className: "bg-inputs-radio-indicator-disabled-bg",
      },
    ],
    defaultVariants: {
      size: "sm",
      isPressed: false,
      isSelected: false,
      isHovered: false,
      isDisabled: false,
    },
  },
);

export interface RadioGroupProps extends Omit<
  AriaRadioGroupProps,
  "className" | "style"
> {}

export function RadioGroup(props: RadioGroupProps) {
  return <AriaRadioGroup {...props} className={radioGroupVariants()} />;
}

export interface RadioProps
  extends
    Omit<AriaRadioProps, "className" | "style" | "children">,
    Omit<VariantProps<typeof radioRootVariants>, "isDisabled"> {
  children?: React.ReactNode;
}

export function Radio({ size = "sm", children, ...props }: RadioProps) {
  return (
    <AriaRadio
      {...props}
      className={(state) =>
        radioRootVariants({
          size,
          isDisabled: state.isDisabled,
        })
      }
    >
      {(state) => {
        const isHovered = state.isDisabled ? false : state.isHovered;
        const isPressed = state.isDisabled ? false : state.isPressed;

        return (
          <>
            <span
              className={controlVariants({
                size,
                isSelected: state.isSelected,
                isHovered,
                isPressed,
                isDisabled: state.isDisabled,
                isFocusVisible: state.isFocusVisible,
              })}
            >
              <span
                className={indicatorVariants({
                  size,
                  isPressed,
                  isSelected: state.isSelected,
                  isHovered,
                  isDisabled: state.isDisabled,
                })}
              />
            </span>
            {children ? <span>{children}</span> : null}
          </>
        );
      }}
    </AriaRadio>
  );
}
