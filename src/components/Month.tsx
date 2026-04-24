import Box from "@mui/material/Box";
import { useState } from "react";
import type { Entry } from "../types/entry";
import { useNavigate } from "react-router-dom";
import Popover from "@mui/material/Popover";

interface MonthProps {
  entries: Entry[];
}

export const Month: React.FC<MonthProps> = ({
  entries
}) => {
  
  const navigate = useNavigate();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [currentDate, setCurrentDate] = useState(new Date());

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [popupItems, setPopupItems] = useState<Entry[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1); //what day the 1st is
  const lastDay = new Date(year, month + 1, 0); //what day the last is
  const totalDays = lastDay.getDate();
  const startWeekday = firstDay.getDay(); //wednesday = 3

  const monthDays: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) { // mark the days before the 1st as null
    monthDays.push(null);
  }
  
  for (let day = 1; day <= totalDays; day++) { // and then push everything else
    monthDays.push(day);
  }

  while (monthDays.length < (Math.ceil(monthDays.length / 7) * 7)) { //ending gray cells
    monthDays.push(null);
  }

  //today indicator
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getFullYear() === year && today.getMonth() === month;

  //month/year label
  const monthYearLabel = currentDate.toLocaleString("default", {
    month: 'long',
    year: 'numeric'
  })

  //buttons to change month/year left and right, and today
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const handleToday = () => {
    setCurrentDate(new Date());
  }

  const getTime = (dateStr: string) => { //returns time of the meeting
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="flex items-center">
        <button onClick={handlePrevMonth}> Prev </button>
        <h2 className="text-2xl p-4 font-bold">{monthYearLabel}</h2>
        <button onClick={handleNextMonth}> Next </button>
        <button className="!m-4" onClick={handleToday}> Back to Today </button>
      </div>
    <Box>
      {/* day headers */}
      <Box sx={{ display: "flex" }}>
        {days.map((day) => (
          <Box
            key={day}
            sx={{
              flex: 1,
              textAlign: "center",
              fontWeight: "bold"
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* month grid */}
      {Array.from({ length: monthDays.length / 7 }).map((_, row) => (
        <Box
          key={row}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            width: "100%",
          }}
        >
          {Array.from({ length: 7 }).map((_, col) => {
            const dayNumber = monthDays[row * 7 + col];
            const isToday = todayMonth && dayNumber == todayDate;
            const isCurrentMonthDay =
              dayNumber &&
              row * 7 + col >= startWeekday &&
              row * 7 + col < startWeekday + totalDays;
            
            let dateKey = null;
            if (isCurrentMonthDay && dayNumber) {
              const date = new Date(year, month, dayNumber);
              dateKey = date.toISOString().split("T")[0]; //split time, result "2026-04-10"
            }
            const dayTodos = entries
              .filter((e) => e.type === "alteration" && e.due === dateKey);
            const dayMeetings = entries
              .filter((e) => e.type === "meeting" && dateKey && e.due?.startsWith(dateKey))
              .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
            const allItems: Entry[] = [ //for overflow
              ...dayMeetings,
              ...dayTodos,
            ];
            const visibleItems = allItems.slice(0, 2); //max 2 to prevent overflow
            const hiddenItems = allItems.slice(2);

            const hiddenMeetings = hiddenItems.filter((item) => item.type === "meeting").length; //for quantity more
            const hiddenTodos = hiddenItems.filter((item) => item.type === "alteration").length;

            const resultString = [];
            if (hiddenMeetings > 0) {
              resultString.push(`+${hiddenMeetings} meeting${hiddenMeetings > 1 ? "s" : ""}`);
            }
            if (hiddenTodos > 0) {
              resultString.push(`+${hiddenTodos} todo${hiddenTodos > 1 ? "s" : ""}`);
            }
            const overflowString = resultString.join(", ");
            
            
            return (
              <Box
                key={col}
                sx={{
                  border: "1px solid black",
                  height: 130,
                  display: "flex",
                  justifyContent: "space-between",
                  paddingRight: "0.5rem",
                  backgroundColor: dayNumber ? "white" : "#c0c0c0",
                  fontSize: "1.25rem",
                  flexDirection: "column",
                }}
              >
                <div className="text-right">
                  <span className={isToday ? "text-green-600 font-bold" : ""}>{dayNumber || ""}</span>
                  {visibleItems.map((item) => {
                    const isComplete = item.status === "Complete" || item.status === "Dropped Off";
                    const isMeeting = item.type === "meeting";
                    return (
                      <div
                        key={item.id}
                        className={`text-left px-1 my-1 text-base cursor-pointer
                          ${isMeeting ? "bg-red-300 hover:bg-red-400" : "bg-blue-300 hover:bg-blue-400"}
                          ${isComplete ? "line-through decoration-3 opacity-60" : ""}`}
                        onClick={() => {
                          navigate(isMeeting ? `/meetings/${item.id}` : `/todo/${item.id}`)
                        }}
                      >
                        {isMeeting ?
                          `${getTime(item.due)} Meeting ${item.id}` :
                          `Todo id ${item.id}`
                        }
                      </div>
                    )
                  })} 
                  {hiddenItems.length > 0 && (
                    <div
                      className="text-left text-base px-1 cursor-pointer bg-gray-300 hover:bg-gray-400"
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        setAnchor(e.currentTarget);
                        setPopupItems(hiddenItems);
                      }}
                    >
                      {overflowString}
                    </div>
                  )}
                </div>
              </Box>
            );
          })}
        </Box>
      ))}
      </Box>
      
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{ paper: { style: { pointerEvents: "auto" } } }} 
      >
        <div
          style={{
            width: anchor?.parentElement?.clientWidth,
          }}>
          {popupItems.map((item) => {
            const isComplete = item.status === "Complete" || item.status === "Dropped Off";
            const isMeeting = item.type === "meeting";
            return (
              <div
                key={item.id}
                className={`text-left px-1 my-1 text-base cursor-pointer
                  ${isMeeting ? "bg-red-300 hover:bg-red-400" : "bg-blue-300 hover:bg-blue-400"}
                  ${isComplete ? "line-through decoration-3 opacity-60" : ""}`}
                onClick={() => {
                  navigate(isMeeting ? `/meetings/${item.id}` : `/todo/${item.id}`)
                }}
              >
                {isMeeting ?
                  `${getTime(item.due)} Meeting ${item.id}` :
                  `Todo id ${item.id}`
                }
              </div>
            )
          })} 
        </div>
      </Popover>
    </>
  );
}