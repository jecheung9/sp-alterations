import type { Entry } from "../types/entry";
import '../styles/statusbutton.css';

interface StatusButtonsProps {
  onChange: (status: Entry["status"]) => void;
  currentStatus: Entry["status"];
}

const statuses: Entry["status"][] = [
  "Not Started",
  "Started",
  "Complete",
  "Dropped Off",
];

const StatusButtons: React.FC<StatusButtonsProps> = ({
  onChange,
  currentStatus
}) => {
  return (
    <div>
      {statuses.map(status => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={status === currentStatus ? "active-status" : ""}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default StatusButtons;
