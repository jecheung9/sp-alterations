import { useState, type FormEvent, useEffect } from 'react';
import type { Client } from '../types/client';
import { useAuth } from '../context/AuthProvider';
import { FetchHelper } from '../utils/Fetch';
import { useNavigate } from 'react-router';

interface AddFormProps {
  onClose: () => void;
  onAddEntry: (entry: {
    type: 'alteration' | 'meeting';
    due: string;
    client: Client;
    price?: number;
    description: string;
  }) => void;
  editHeader?: string;
  initialMode?: 'alteration' | 'meeting';
  initialData?: {
    client: Client;
    due: string;
    price?: number;
    description: string;
  }
  onUpdateEntry?: (entry: {
    type: 'alteration' | 'meeting';
    due: string;
    client: Client;
    price?: number;
    description: string;
  }) => void;
  isEdit?: boolean
}

const AddForm: React.FC<AddFormProps> = ({
  onClose,
  onAddEntry,
  editHeader,
  initialMode,
  initialData,
  onUpdateEntry,
  isEdit
}) => {

  const [date, setDate] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  type FormMode = 'alteration' | 'meeting';
  const [mode, setMode] = useState<FormMode>(initialMode || 'alteration');
  
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

    if (!description.trim()) {
      newErrors.description = "Description is required."
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

    const entryData = {
      type: mode,
      client: client!,
      due: date,
      price: mode === 'alteration' ? Number(price) : undefined,
      description
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

          {!isEdit && (
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

        <div className="grid grid-cols-[max-content_1fr] gap-4 items-center w-full">
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

          <label className="justify-self-end whitespace-nowrap mt-[0.35rem] text-lg self-start"
            htmlFor='description'>Description<span className="text-red-500">*</span></label>
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