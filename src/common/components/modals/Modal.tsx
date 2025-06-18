import './Modal.scss';

interface ModalProps {
    isOpen: boolean,
    children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = (props) => {
    return <>
        {props.isOpen && (
            <div className="modal">
                <div className="modal-wrapper">
                    <div className="modal-content">
                        {props.children}
                    </div>
                </div>
            </div>
        )}
    </>
}