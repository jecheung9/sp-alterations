import Box from "@mui/material/Box";

export default function Month() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = 2026;
  const month = 3; // april for example for now

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

  return (
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
            return (
              <Box
                key={col}
                sx={{
                  border: "1px solid black",
                  height: 120,
                  display: "flex",
                  justifyContent: "right",
                  paddingRight: "0.5rem",
                  backgroundColor: dayNumber ? "white" : "#c0c0c0",
                }}
              >
                {dayNumber || ""}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}