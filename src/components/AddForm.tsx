import { useState, type FormEvent, useEffect } from 'react';
import '../styles/addform.css'
import type { Client } from '../types/client';

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
  const [mode, setMode] = useState<FormMode>(initialMode ||'alteration');


  useEffect(() => {
    setErrors({});
    if (mode === 'meeting') {
      setDate('');
    }
  }, [mode]);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("http://localhost:3000/api/clients");
        const data = await res.json();
        setClientsData(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadClients();
  }, []);

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
    <div className="add-entry-modal">
      <form className='add-entry-form' onSubmit={handleSubmit}>
        <div className='form-header'>
          <div className='header-top'>
          <h3>{editHeader ? editHeader : mode === 'alteration'
            ? "Add an alterations entry"
            : "Add a meeting"}</h3>
          <button type="button" className='close-button' onClick={onClose}> Close </button>
          </div>

          {!isEdit && (
            <div className='mode-toggle'>
              Choose mode:
            <button
              type="button"
              className={`mode-button ${mode === 'alteration' ? 'active' : ''}`}
              onClick={() => setMode('alteration')}> Alterations
            </button> 
            
            <button
              type="button"
              className={`mode-button ${mode === 'meeting' ? 'active' : ''}`}
              onClick={() => setMode('meeting')}> Meeting
            </button> 
            </div>
          )}
        </div> 

        <div className='form-contents'>
          <label htmlFor="client">Client<span>*</span></label>
          <select
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

          <label htmlFor='date'>
            {mode === 'alteration' ? 'Date' : 'Date & Time'}
            <span>*</span></label>
          <input
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
            <label htmlFor='price'>Price<span>*</span></label>
            <input
              type='text'
              id='price'
              placeholder='0'
              min='0'
              value={price}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "")
                setPrice(value)
                errors.price && setErrors(prev => ({ ...prev, price: "" }));
              }}
            />
          </>    
          )} 

          <label className='description-label' htmlFor='description'>Description<span>*</span></label>
          <textarea
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
          <div className="error-box">
            <ul className="error-list">
              {Object.values(errors)
                .filter(err => err)
                .map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
          )}
        <button className='submit-button' type='submit'> Submit Entry</button>
      </form>
    </div>
  )
}

export default AddForm;