import { Month } from "../components/Month";
import type { Entry } from "../types/entry";

interface CalendarProps {
  entries: Entry[];
}

const Calendar: React.FC<CalendarProps> = ({
  entries
}) => {
  return (
    <div className="flex-1">
      <h1 className="text-4xl p-1 font-bold">Calendar</h1>
      <Month entries={entries} />
    </div>
  )
}

export default Calendar;