import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={`p-4 bg-white text-slate-900 border border-slate-200 shadow-xl rounded-xl inline-block ${className}`}
      classNames={{
        months: "space-y-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-semibold text-slate-800",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-slate-200 rounded-md flex items-center justify-center transition-colors",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse border-spacing-0",
        head_row: "",
        head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] text-center pb-2",
        row: "w-full mt-2",
        cell: "text-center text-sm p-0 relative",
        day: "h-9 w-9 mx-auto p-0 font-normal rounded-md hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-700",
        day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-md font-bold shadow-md",
        day_today: "bg-slate-100 text-blue-600 font-bold",
        day_outside: "text-slate-400 opacity-50",
        day_disabled: "text-slate-400 opacity-50",
        day_hidden: "invisible",
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
