interface ConfirmDeleteProps {
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  onConfirm,
  onCancel,
  message,
}) => {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 flex justify-center items-center z-[9999]">
      <div className="rounded-lg bg-white p-8 flex flex-col gap-4">
        <div className="flex gap-4">
          <p className="text-3xl">{message}</p>
          <button className='hover:!bg-[#ff4444]' onClick={onCancel}> X </button>
        </div>
        <div className="flex gap-8 justify-center">
          <button onClick={onCancel} className="!px-6">
            Cancel
          </button>
          <button onClick={onConfirm} className="!px-6 !bg-red-400 hover:!bg-[#ff4444]">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDelete;