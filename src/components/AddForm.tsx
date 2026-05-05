import { useState, type FormEvent, useEffect } from 'react';
import type { Client } from '../types/client';
import { useAuth } from '../context/AuthProvider';
import { FetchHelper } from '../utils/Fetch';
import { useNavigate } from 'react-router';
import type { NewAlterationEntry, NewMeetingEntry } from '../types/entry';

type NewEntry = NewAlterationEntry | NewMeetingEntry;

interface AddFormProps {
  onClose: () => void;
  onAddEntry: (entry: NewEntry) => void;
  editHeader?: string;
  initialMode?: 'alteration' | 'meeting';
  initialData?: {
    client: Client;
    due: string;
    price?: number;
    description: string;
  }
  onUpdateEntry?: (entry: NewEntry) => void;
  isEdit?: boolean
  allowModeToggle?: boolean;
}

const AddForm: React.FC<AddFormProps> = ({
  onClose,
  onAddEntry,
  editHeader,
  initialMode,
  initialData,
  onUpdateEntry,
  isEdit,
  allowModeToggle = true,
}) => {

  const [date, setDate] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  type FormMode = 'alteration' | 'meeting';
  const [mode, setMode] = useState<FormMode>(initialMode || 'alteration');

  const [meetingType, setMeetingType] = useState<"pickup" | "dropoff" | "">("");
  
  const { token, onLogout } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    setErrors({});
    if (mode === 'meeting') {
      setDate('');
    }
  }, [mode]);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await FetchHelper(
          "http://localhost:3000/api/clients",
          {},
          token,
          onLogout, 
          navigate
        );

        if (!res) return; // token expired or invalid, exit early
        const data = await res.json();
        setClientsData(data);
      } catch (err) {
        console.error(err);
      }
    }

    if (token) {
      loadClients();
    }
  }, [token]);

  useEffect(() => {
    if (initialData) {
      const selectedClient = clientsData.find(c => c._id === initialData.client._id) || null;
      setClient(selectedClient);
      setDate(
        mode === 'meeting'
          ? initialData.due.slice(0, 16)
          : initialData.due.slice(0, 10)
      );
      setPrice(initialData.price ? String(initialData.price) : "");
      setDescription(initialData.description);
    }
  }, [initialData, mode, clientsData])




  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!client) {
      newErrors.client = "A client is required."
    }
    if (!date) {
      newErrors.date =
        mode === 'alteration'
        ? "Date is required."
        : "Date and time is required."
    }
    if (date) {
      let selectedDate: Date;
      if (mode === 'alteration') {
        const [year, month, day] = date.split("-").map(Number);
        selectedDate = new Date(year, month - 1, day);
        selectedDate.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (selectedDate < now) {
          newErrors.date = "Selected date cannot be in the past.";
        }
      } else {
        selectedDate = new Date(date);
        const now = new Date();

        if (selectedDate < now) {
          newErrors.date = "Selected date and time cannot be in the past.";
        }
      }
    }
    if (mode === 'alteration' && !price) {
      newErrors.price = "Price is required."
    }

    if (mode === 'alteration' && !description.trim()) {
      newErrors.description = "Description is required."
    }

    if (mode === 'meeting' && !meetingType) {
      newErrors.meetingType = "Meeting type is required."
    }

    if (mode === 'meeting' && meetingType === 'dropoff') {
      // placeholder for later, where we must pick one item from array.
    }

    return newErrors;

  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    let entryData: NewEntry;

    if (mode === "alteration") {
      entryData = {
        type: "alteration",
        due: date,
        client: client!,
        status: "Not Started",
        price: Number(price),
        description: description.trim(),
      };
    } else {
      if (meetingType === "pickup") {
        entryData = {
          type: "meeting",
          meetingType: "pickup",
          due: date,
          client: client!,
          status: "Not Started",
          description: description.trim() || undefined,
        };
      } else {
        entryData = {
          type: "meeting",
          meetingType: "dropoff",
          due: date,
          client: client!,
          status: "Not Started",
          alterationIds: [],
        };
      }
    }
    
    if (isEdit && onUpdateEntry) {
      onUpdateEntry(entryData);
    } else {
      onAddEntry(entryData);
    }

    onClose();

    setClient(null);
    setDate('');
    setPrice('');
    setDescription('');
    setMeetingType('');
  }


  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 flex justify-center items-center">
      <form className="w-150 rounded-lg bg-white flex flex-col items-center p-12" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center min-w-full relative">
          <h3 className="text-3xl font-bold mx-auto">{editHeader ? editHeader : mode === 'alteration'
            ? "Add an alterations entry"
            : "Add a meeting"}</h3>
          <button type="button" className='absolute right-0 hover:!bg-[#ff4444]' onClick={onClose}> Close </button>
          </div>

          {!isEdit && allowModeToggle && (
            <div className='flex gap-2 justify-center mb-6 items-center'>
              Choose mode:
            <button
              type="button"
              className={`mode-button ${mode === 'alteration' ? '!bg-[#2c3e50] !text-white' : ''}`}
              onClick={() => setMode('alteration')}> Alterations
            </button> 
            
            <button
              type="button"
              className={`mode-button ${mode === 'meeting' ? '!bg-[#2c3e50] !text-white' : ''}`}
              onClick={() => setMode('meeting')}> Meeting
            </button> 
            </div>
          )}
        </div> 

        <div className="grid grid-cols-[max-content_2fr] gap-4 items-center w-full">
          <label className="justify-self-end whitespace-nowrap mt-[0.35rem] text-lg"
            htmlFor="client">Client<span className="text-red-500">*</span></label>
          <select
            className='border rounded py-1 mt-[0.35rem] text-lg'
            id="client"
            name='client'
            value={client?._id || ""}
            onChange={(e) => {
              const selectedClient = clientsData.find(c => c._id === e.target.value) || null;
              setClient(selectedClient);
              errors.client && setErrors(prev => ({ ...prev, client: "" }));
            }}
          >
            <option value="">Select client</option>
            {clientsData.map(client => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>

          <label className="justify-self-end whitespace-nowrap mt-[0.35rem] text-lg" htmlFor='date'>
            {mode === 'alteration' ? 'Date' : 'Date & Time'}
            <span className="text-red-500">*</span></label>
          <input
            className='border rounded mt-[0.35rem] text-lg'
            type={mode === 'alteration' ? 'date' : 'datetime-local'}
            id='date'
            name='date'
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              errors.date && setErrors(prev => ({ ...prev, date: "" }));
            }} // format 2026-01-29
          />

          {mode === 'alteration' && (
          <>
              <label className="justify-self-end whitespace-nowrap mt-[0.35rem] text-lg"
                htmlFor='price'>Price<span className="text-red-500">*</span></label>
              <input
              className="appearance-textfield border rounded mt-[0.35rem] text-lg"
              type='text'
              id='price'
              placeholder='0'
              min='0'
              autoComplete='off'
              value={price}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "")
                setPrice(value)
                errors.price && setErrors(prev => ({ ...prev, price: "" }));
              }}
            />
          </>    
          )} 



          {mode === "alteration" ? (
            <>
              <label
                className="justify-self-end whitespace-nowrap mt-[0.35rem] text-lg self-start"
                htmlFor='description'>
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                className="resize-none border rounded mt-[0.35rem] text-lg h-[10rem]"
                id='description'
                name='description'
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  errors.description && setErrors(prev => ({ ...prev, description: "" }));
                }}
              />
            </>
          ) : (
            <>
              <label
                className="justify-self-end whitespace-nowrap mt-[0.35rem] text-lg self-start"
                htmlFor='meetingType'>
                Meeting Type<span className="text-red-500">*</span> 
              </label>
                
              <div className="flex gap-8 items-center mt-[0.35rem]">
                <label className="flex items-center gap-2 cursor-pointer text-lg">
                  <input
                    type="radio"
                    checked={meetingType === "pickup"}
                    onChange={() => setMeetingType("pickup")}
                  />
                  Pickup
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-lg">
                  <input
                    type="radio"
                    checked={meetingType === "dropoff"}
                    onChange={() => setMeetingType("dropoff")}
                  />
                  Drop Off
                </label>
                </div>
                

                {meetingType === "pickup" && (
                  <>
                    <label className="justify-self-end mt-[0.35rem] text-lg self-start text-right leading-tight">
                      <span>Description</span>
                      <span className="block text-sm text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      className="resize-none border rounded mt-[0.35rem] text-lg h-[5rem]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </>
                )}

                {meetingType === "dropoff" && (
                  <>
                    <label className="justify-self-end whitespace-nowrap mt-[0.35rem] text-lg self-start">
                      Alterations<span className="text-red-500">*</span>
                    </label>
                    <div>
                      (select alterations here later)
                    </div>
                  </>
                )}
            </>    
          )}
        </div>

        {Object.values(errors).some(err => err) && (
          <div className="bg-[#fef2f2] border border-[#fca5a5] text-[#b91c1c] p-3 rounded-md mt-3">
            <ul className="list-disc ml-4">
              {Object.values(errors)
                .filter(err => err)
                .map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
          )}
        <button className="!mt-6 !px-[1.2em] !py-[0.6em] hover:!bg-[#22c55e] active:!bg-[#16a34a]" type='submit'> Submit Entry</button>
      </form>
    </div>
  )
}

export default AddForm;