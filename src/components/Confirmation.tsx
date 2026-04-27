interface ConfirmationProps {
  message: string;
  onClose: () => void;
  type?: "default" | "delete"
  onUndo?: () => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  message,
  onClose,
  type = "default",
  onUndo,
}) => {

  return (
    <div className="fixed bottom-4 left-1/2 bg-[#2ecc71] text-white rounded-lg p-2 z-[9999] flex items-center gap-2">
      {message}
      {type === "delete" && onUndo && (
        <button onClick={onUndo}>Undo</button>
      )}
      <button onClick={onClose}>x</button>
    </div>
  );
};

export default Confirmation;