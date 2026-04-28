import { useParams } from "react-router-dom";
import type { Entry } from "../types/entry";
import StatusButtons from "../components/StatusButtons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AddForm from "../components/AddForm";
import ConfirmDelete from "../components/ConfirmDelete";

interface MeetingDetailProps {
  entries: Entry[];
  updateMeeting: (updatedMeeting: Entry, statusOnly: boolean) => void;
  deleteMeeting: (entry: Entry) => void;
  showToast: (message: string, type?: "default" | "delete") => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({
  entries,
  updateMeeting,
  deleteMeeting,
  showToast,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
    return <div className="page-container"><p className="text-gray-500">Meeting not found</p></div>;
  }

  const handleDelete = async () => {
    deleteMeeting(meeting);
    setIsConfirmOpen(false);
    navigate("/meetings");
  }
    

  return (
    <div className="page-container">
      <h1 className="font-bold text-2xl">Meeting #{meeting.id}</h1>
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
      <button onClick={() => setIsConfirmOpen(true)}>Delete</button>

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
            showToast("Meeting updated successfully!", "default");
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

      {isConfirmOpen && (
        <ConfirmDelete
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          message="Are you sure you want to delete this meeting?"
        />
      )}
    </div>
  );
}


export default MeetingDetail;
