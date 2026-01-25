import { useState, type ChangeEvent, type FormEvent } from 'react';
import '../styles/addform.css'

interface AddFormProps {
  onClose: () => void;
}

const AddForm: React.FC<AddFormProps> = ({
  onClose,
}) => {

  const [date, setDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Form submitted");
    onClose();
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    console.log(e.target.value);
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
          <select id="client" name='client'>
            <option> Please select an option</option>
            <option> Benny - B&B Menswear</option>
            <option> Catherine - 11th State</option>
            <option> Hall Madden</option>
            <option> A.P.C.</option>
            <option> Personal</option>
          </select>

          <label htmlFor='date'>Date</label>
          <input
            type='date'
            id='date'
            name='date'
            value={date}
            onChange={handleDateChange} // format 2026-01-29
          />

          <label htmlFor='price'>Price</label>
          <input
            type='number'
            id='price'
            placeholder='0'
            min='0'
          />

          <label className='description-label' htmlFor='description'>Description</label>
          <textarea
            id='description'
            name='description'
          />
        </div>
        <button className='submit-button' type='submit'> Submit Entry</button>
      </form>
    </div>
  )
}

export default AddForm;