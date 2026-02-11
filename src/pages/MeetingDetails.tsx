import { useParams } from "react-router";
import type { Entry } from "../types/entry";
import StatusButtons from "../components/StatusButtons";
import { useNavigate } from "react-router";

interface MeetingDetailProps {
  entries: Entry[];
  updateStatus: (id: number, status: Entry['status']) => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({
  entries,
  updateStatus
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const meeting = entries.find(e => e.id.toString() === id);
    
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



  if (!meeting) {
    return <div className="page-container"><p>Meeting not found</p></div>;
  }
    

  return (
    <div className="page-container">
      <h1>Meeting #{meeting.id}</h1>
      <p>Status: {meeting.status}</p>
      <p>Client: {meeting.client}</p>
      <p>Date + time: {formatDateTime(meeting.due)}</p>
      <p>Description: {meeting.description}</p>

      <StatusButtons
        entryId={meeting.id}
        onChange={updateStatus}
        currentStatus={meeting.status}
      />

      <button onClick={() => navigate(`/meetings`)}>
        Return back to meetings list
      </button>
    </div>
  );
}


export default MeetingDetail;
