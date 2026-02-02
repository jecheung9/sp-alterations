import { useState, type FormEvent } from 'react';
import '../styles/addform.css'
import { clientsData } from '../mockdata/clients';

interface AddFormProps {
  onClose: () => void;
  onAddEntry: (entry: { duedate: string; client: string; price: number; description: string }) => void;
}

const AddForm: React.FC<AddFormProps> = ({
  onClose,
  onAddEntry,
}) => {

  const [date, setDate] = useState('');
  const [client, setClient] = useState('');
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!client.trim()) {
      newErrors.client = "A client is required."
    }
    if (!date) {
      newErrors.date = "Date is required."
    }
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Selected date cannot be in the past.";
      }
    }
    if (!price) {
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

    onAddEntry({
      client,
      duedate: date,
      price: Number(price),
      description
    })

    onClose();

    setClient('');
    setDate('');
    setPrice('');
    setDescription('');
  }


  return (
    <div className="add-entry-modal">
      <form className='add-entry-form' onSubmit={handleSubmit}>
        <div className='form-header'>
          <h3>Add an alterations entry</h3>
          <button type="button" className='close-button' onClick={onClose}> Close </button>
        </div>

        <div className='form-contents'>
          <label htmlFor="client">Client<span>*</span></label>
          <select
            id="client"
            name='client'
            value={client}
            onChange={(e) => {
              setClient(e.target.value);
              errors.client && setErrors(prev => ({ ...prev, client: "" }));
            }}
          >
            <option value="">Select client</option>
            {clientsData.map(client => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>

          <label htmlFor='date'>Date<span>*</span></label>
          <input
            type='date'
            id='date'
            name='date'
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              errors.date && setErrors(prev => ({ ...prev, date: "" }));
            }} // format 2026-01-29
          />

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