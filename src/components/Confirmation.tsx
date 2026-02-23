import { useEffect } from "react";
import "../styles/confirmation.css"

interface ConfirmationProps {
  message: string;
  onClose: () => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  message,
  onClose,
}) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="confirmation-toast">
      {message}
      <button onClick={onClose}>x</button>
    </div>
  );
};

export default Confirmation;