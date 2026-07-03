"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn("flex h-full w-full flex-col overflow-hidden text-fg", className)}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  title?: string;
  children: React.ReactNode;
}

function CommandDialog({ title = "Command palette", children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        hideClose
        aria-describedby={undefined}
        className="top-[18%] max-w-xl -translate-y-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Command
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-4 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:eyebrow"
          loop
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center gap-3 border-b border-line px-5" cmdk-input-wrapper="">
    <SearchIcon className="size-4 shrink-0 text-faint" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "h-14 w-full bg-transparent text-sm text-fg outline-none placeholder:text-faint",
        className,
      )}
      {...props}
    />
    <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.65rem] text-faint">
      esc
    </kbd>
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[22rem] overflow-x-hidden overflow-y-auto p-2 pb-3", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-8 text-center font-mono text-xs text-faint"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group ref={ref} className={cn("overflow-hidden", className)} {...props} />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted select-none",
      "outline-none data-[selected=true]:bg-panel-strong data-[selected=true]:text-fg",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-faint data-[selected=true]:[&_svg]:text-ion",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("mx-2 my-1 h-px bg-line", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto font-mono text-[0.65rem] tracking-widest text-faint", className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
};
