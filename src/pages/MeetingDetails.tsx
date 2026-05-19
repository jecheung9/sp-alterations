import { useParams } from "react-router-dom";
import type { Entry, MeetingEntry } from "../types/entry";
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

  const meeting = entries
    .filter((e): e is MeetingEntry => e.type === "meeting")
    .find(e => e.id.toString() === id);
    
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

  const getMeetingNotes = (entry: Entry) => {
    if (entry.type === "meeting") {
      if (entry.meetingType === "pickup") {
        return entry.description ? `Pickup: ${entry.description}` : "Pickup"
      }
      return (
        <>
          Dropoff:{" "}
          {entry.alterationIds.map((id, index) => (
            <span key={id}>
              <span
                onClick={() => navigate(`/todo/${id}`)}
                className="text-blue-600 underline cursor-pointer"
              >
                {id}
              </span>
              {index < entry.alterationIds.length - 1 ? ", " : ""}
            </span>
          ))}
        </>
      )}
  };
  
  return (
    <div className="page-container p-2">
      <h1 className="font-bold text-2xl">Meeting #{meeting.id}</h1>
      <p>Status: {meeting.status}</p>
      <p>Client: {meeting.client?.name}</p>
      <p>Date + time: {formatDateTime(meeting.due)}</p>
      <p>Notes: {getMeetingNotes(meeting)}</p>

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
        <>
        <AddForm
          isEdit
          onClose={() => setIsEditOpen(false)}
          onAddEntry={() => { }}
            onUpdateEntry={(newData) => {
              const newMeetingType = (newData as any).meetingType ?? meeting.meetingType;
            const updated: Entry = {
              ...meeting,
              client: newData.client ?? meeting.client,
              due: newData.due ?? meeting.due,
              status: meeting.status,
              meetingType: newMeetingType
            };
              
            if (newMeetingType === "pickup") {
              const desc = (newData as any).description?.trim();
              (updated as any).description = desc ? desc : null;

              (updated as any).alterationIds = undefined;
            }

            if (newMeetingType === "dropoff") {
              (updated as any).alterationIds =
                (newData as any).alterationIds ?? (meeting as any).alterationIds;

              (updated as any).description = undefined;
            }

            if (meeting.type === "meeting" && meeting.meetingType === "pickup") {
              const desc = (newData as any).description?.trim();
              (updated as any).description = desc ? desc : null;
            }

            if (meeting.type === "meeting" && meeting.meetingType === "dropoff") {
              (updated as any).alterationIds =
                (newData as any).alterationIds ?? (meeting as any).alterationIds;
            }

            updateMeeting(updated, false);
            showToast("Meeting updated successfully!", "default");
            setIsEditOpen(false);
          }}
          editHeader={`Edit meeting #${meeting.id}`}
          initialMode="meeting"
          initialData={{
            client: meeting.client,
            due: meeting.due,
            description: meeting.meetingType === "pickup" ? meeting.description : "",
            meetingType: meeting.meetingType,
            alterationIds:
              meeting.type === "meeting" && meeting.meetingType === "dropoff"
                ? meeting.alterationIds
                : [],
          }}
          entries={entries}
          />
      </>   
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
