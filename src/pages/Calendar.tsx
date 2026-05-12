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
      <div className="flex flex-row items-baseline">
        <h1 className="text-4xl p-1 font-bold">Calendar</h1>
        <div className="font-bold ml-3 mr-1 sm:hidden block">Key: </div>
        <div className="px-1 bg-red-300 sm:hidden block">Meetings</div>
        <div className="ml-3 px-1 bg-blue-300 sm:hidden block">Todos</div>
      </div>
      <Month entries={entries} />
    </div>
  )
}

export default Calendar;