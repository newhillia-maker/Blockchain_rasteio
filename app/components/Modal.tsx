import { FiX } from "react-icons/fi";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <FiX size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
