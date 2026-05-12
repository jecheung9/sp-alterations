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
  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        return (
          <div>
            {entry.id}
            {entry.status}
            {entry.client?.name}
          </div> 
        )
      })}
    </div>
  )

}

export default MobileCards;