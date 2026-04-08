import Month from "../components/Month";

const Calendar = () => {
  return (
    <div className="flex-1">
      <h1 className="text-4xl p-1 font-bold">Calendar</h1>
      <Month />
    </div>
  )
}

export default Calendar;