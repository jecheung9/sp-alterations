import React from "react";
import type { Entry } from "../types/entry";
import { useNavigate } from "react-router";

interface MobileCardsMeetingsProps {
  entries: Entry[];
}

const MobileCardsMeetings: React.FC<MobileCardsMeetingsProps> = ({
  entries,
}) => {
  const navigate = useNavigate();


  const formatDateTime = (dateTime: string) => {
    const dateTimeObject = new Date(dateTime);
    return dateTimeObject.toLocaleDateString("en-us", {
      weekday: "short",
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } 

  const isLate = (entry: Entry) => {
    const today = new Date();
    const dueDate = new Date(entry.due);
    return (
      (dueDate < today) && entry.status === "Not Started"
    )
  }

  const getMeetingNotes = (entry: Entry) => {
  if (entry.type === "meeting") {
    if (entry.meetingType === "pickup") {
      return entry.description ? `Pickup: ${entry.description}` : "Pickup"
    }
    return `Dropoff: ${entry.alterationIds.join(", ")}` 
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-8">
      {entries.map((entry) => {
        return (
          <div
            className="w-full border rounded-lg flex flex-col p-2 cursor-pointer mb-2"
            onClick={() => navigate(`/meetings/${entry.id}`)}>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <span className="font-bold text-xl">#{entry.id}</span>
                <span className={`${isLate(entry) ? "text-red-600 font-bold" : ""}`}>
                  {formatDateTime(entry.due)}
                </span>
              </div>

              <span
                className={`
                  px-2 py-1 rounded text-sm font-medium
                  ${entry.status === "Not Started" ? "bg-[#e74c3c] text-white" : ""}
                  ${entry.status === "Started" ? "bg-[#f1c40f] text-black" : ""}
                  ${entry.status === "Complete" ? "bg-[#2ecc71] text-white" : ""}
                `}
              >
                {entry.status}
              </span>

            </div>
            <span>{entry.client?.name}</span>
            <span>{getMeetingNotes(entry)}</span>
          </div> 
        )
      })}
    </div>
  )

}

export default MobileCardsMeetings;