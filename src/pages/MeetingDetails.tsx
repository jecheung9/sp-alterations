import { useParams } from "react-router";
import type { Entry } from "../types/entry";
import StatusButtons from "../components/StatusButtons";
import { useNavigate } from "react-router";
import { useState } from "react";
import AddForm from "../components/AddForm";

interface MeetingDetailProps {
  entries: Entry[];
  updateStatus: (id: number, type: Entry["type"], status: Entry["status"])  => void;
  updateEntry: (updatedEntry: Entry) => void;
  deleteEntry: (id: number, type: Entry["type"]) => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({
  entries,
  updateStatus,
  updateEntry,
  deleteEntry
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
      <p>Client: {meeting.client}</p>
      <p>Date + time: {formatDateTime(meeting.due)}</p>
      <p>Description: {meeting.description}</p>

      <StatusButtons
        entryId={meeting.id}
        onChange={(id, status) =>
          updateStatus(id, meeting.type, status)
        }
        currentStatus={meeting.status}
      />

      <button onClick={() => setIsEditOpen(true)}>Edit</button>
      <button onClick={() => {
        deleteEntry(meeting.id, meeting.type);
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
            updateEntry({
              id: meeting.id,
              status: meeting.status,
              ...newData
            });
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
