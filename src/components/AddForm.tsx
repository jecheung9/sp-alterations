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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

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
          <label htmlFor="client">Client </label>
          <select id="client" name='client' value={client} onChange={e => setClient(e.target.value)}>
            <option>Select client</option>
            {clientsData.map(client => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>

          <label htmlFor='date'>Date</label>
          <input
            type='date'
            id='date'
            name='date'
            value={date}
            onChange={e => setDate(e.target.value)} // format 2026-01-29
          />

          <label htmlFor='price'>Price</label>
          <input
            type='number'
            id='price'
            placeholder='0'
            min='0'
            value={price}
            onChange={e => setPrice(e.target.value)}
          />

          <label className='description-label' htmlFor='description'>Description</label>
          <textarea
            id='description'
            name='description'
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <button className='submit-button' type='submit'> Submit Entry</button>
      </form>
    </div>
  )
}

export default AddForm;