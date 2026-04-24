import { useEffect } from "react";

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
    <div className="fixed bottom-4 left-1/2 bg-[#2ecc71] text-white rounded-lg p-2 z-[9999] flex items-center gap-2">
      {message}
      <button onClick={onClose}>x</button>
    </div>
  );
};

export default Confirmation;