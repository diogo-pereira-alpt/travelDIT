"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  DateFormatter,
  DayPicker,
  Formatters,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";


export type CalendarProps = React.ComponentProps<typeof DayPicker>;

//TODO: Limitar o calendario ate 1 ano?
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const primeiraLetraMaiuscula = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatCaption: DateFormatter = (date, options) => {
    const mes = format(date, "LLLL", { locale: options?.locale });
    const year = format(date, "yyyy", { locale: options?.locale });
    return (
      <>
        {primeiraLetraMaiuscula(mes)} {year}{" "}
      </>
    );
  };

  const formatWeekdayName: DateFormatter = (date, options) => {
    return <>{format(date, "EEEEE", { locale: options?.locale })} </>;
  };
  return (
    <DayPicker
      locale={ptBR}
      weekStartsOn={1}
      // disabled={{before: new Date()}}
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown-buttons" //Also: dropdown | buttons

      className={cn("m-0 ", className)}
      formatters={{ formatCaption, formatWeekdayName } as Partial<Formatters>}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 ",
        month: "space-y-2 ",
        caption:
          "flex justify-center relative items-center bg-color-black-meo p-3 bg-clip-border rounded-t-md",
        caption_label: "text-white text-[13px] font-semibold",
        nav: "space-x-1 flex items-center text-white",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 "
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse ",
        head_row: "flex ",
        head_cell:
          "text-muted-foreground rounded-md w-7 font-normal text-[0.8rem]",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-full"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 font-light text-[12px] font-montserrat aria-selected:opacity-100 rounded-full text-black focus:text-white hover:text-white hover:bg-color-blue-meo focus:bg-color-black-meo"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-color-black-meo text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary  focus:text-primary-foreground",
        day_today:
          "bg-transparent text-black  outline-1 outline outline-color-grey-ccc-meo",
        day_outside:
          " ",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",

        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
        
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
