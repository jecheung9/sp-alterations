import { useParams } from "react-router";
import type { Entry } from "../types/entry";
import StatusButtons from "../components/StatusButtons";
import { useNavigate } from "react-router";
import { useState } from "react";
import AddForm from "../components/AddForm";

interface MeetingDetailProps {
  entries: Entry[];
  updateMeeting: (updatedMeeting: Entry, statusOnly: boolean) => void;
  deleteMeeting: (id: number, type: Entry["type"]) => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({
  entries,
  updateMeeting,
  deleteMeeting
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);

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
      <p>Client: {meeting.client?.name}</p>
      <p>Date + time: {formatDateTime(meeting.due)}</p>
      <p>Description: {meeting.description}</p>

      <StatusButtons
        onChange={(status) =>
          updateMeeting({ ...meeting, status }, true) 
        }
        currentStatus={meeting.status}
        mode="meeting"
      />

      <button onClick={() => setIsEditOpen(true)}>Edit</button>
      <button onClick={() => {
        deleteMeeting(meeting.id, meeting.type);
        navigate(`/meetings`);
      }}>Delete</button>

      <button onClick={() => navigate(`/meetings`)}>
        Return back to meetings list
      </button>

      {isEditOpen && (
        <AddForm
          isEdit
          onClose={() => setIsEditOpen(false)}
          onAddEntry={() => { }}
          onUpdateEntry={(newData) => {
            updateMeeting({
              ...meeting,
              client: newData.client || meeting.client,
              due: newData.due || meeting.due,
              description: newData.description || meeting.description,
              status: meeting.status,
            }, false);
            setIsEditOpen(false);
          }}
          editHeader={`Edit meeting #${meeting.id}`}
          initialMode="meeting"
          initialData={{
            client: meeting.client,
            due: meeting.due,
            description: meeting.description
          }}
        />
      )}
    </div>
  );
}


export default MeetingDetail;
