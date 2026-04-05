import type { Entry } from "../types/entry";

interface StatusButtonsProps {
  onChange: (status: Entry["status"]) => void;
  currentStatus: Entry["status"];
  mode: "alteration" | "meeting";
}

const statuses: Entry["status"][] = [
  "Not Started",
  "Started",
  "Complete",
  "Dropped Off",
];

const StatusButtons: React.FC<StatusButtonsProps> = ({
  onChange,
  currentStatus,
  mode,
}) => {
  const newStatuses = (mode === "meeting") ? ["Not Started", "Complete"] as const : statuses;
  return (
    <div>
      {newStatuses.map(status => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={status === currentStatus ? "!bg-[#2c3e50] !text-white" : ""}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default StatusButtons;
