import React from "react";
import type { Entry } from "../types/entry";
import { useNavigate } from "react-router";

interface MobileCardsProps {
  entries: Entry[];
}

const MobileCards: React.FC<MobileCardsProps> = ({
  entries,
}) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const dateObject = new Date(year, month - 1, day);
    return dateObject.toLocaleDateString("en-us", {
      weekday: "short",
      year: '2-digit',
      month: 'numeric',
      day: 'numeric'
    })
  } 

  const isLate = (entry: Entry) => {
    const today = new Date(); //ignore time for todos
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = entry.due.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);

    return (
      (dueDate < today) && (entry.status === "Not Started" || entry.status === "Started")
    );
  }

  return (
    <div className="flex flex-col gap-3 mb-8">
      {entries.map((entry) => {
        const alteration = entry as any;
        return (
          <div
            className="w-full border rounded-lg flex flex-col p-2 cursor-pointer mb-2"
            onClick={() => navigate(`/todo/${entry.id}`)}>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <span className="font-bold text-xl">#{entry.id}</span>
                <span className={`${isLate(entry) ? "text-red-600 font-bold" : ""}`}>
                  {formatDate(entry.due)}
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
            <span>Price: {alteration.price}</span>
            <span>{alteration.description}</span>
          </div> 
        )
      })}
    </div>
  )

}

export default MobileCards;