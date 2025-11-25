import { useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

export function DateRangeFilter({ onSelectRange }) {
  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  const handleSelect = (range) => {
    if (!range) {
      setDate({ from: null, to: null });
      onSelectRange(null, null);
      return;
    }

    if (range.from && !range.to) {
      setDate({ from: range.from, to: null });
      return;
    }

    if (range.from && range.to) {
      setDate(range);
      onSelectRange(range.from, range.to);
      return;
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[260px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date.from ? (
            date.to ? (
              <>
                {format(date.from, "dd/MM/yyyy")} – {format(date.to, "dd/MM/yyyy")}
              </>
            ) : (
              format(date.from, "dd/MM/yyyy")
            )
          ) : (
            "Selecionar intervalo"
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}