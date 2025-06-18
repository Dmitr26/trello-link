import { useState } from 'react';
import { SubmitHandler } from '../../../SubmitHandler';
import { WordPattern } from '../../../WordPattern';
import { toast } from 'react-toastify';
import api from '../../../../api/request';

interface NewBoardModalProps {
    onClose: () => void,
    fetchDataAgain: () => void
}

export const NewBoardModal: React.FC<NewBoardModalProps> = ({ onClose, fetchDataAgain }) => {

    const [boardName, setBoardName] = useState<string>('');
    const [boardColor, setBoardColor] = useState<string>('#0875b0');
    const [warning, setWarning] = useState<string>('');

    const closeModal = () => {
        setBoardName('');
        setWarning('');
        onClose();
    }

    const postData = async () => {

        if (boardName === '') {
            setWarning('Будь ласка, вкажіть назву для дошки!');
            return;
        }

        if (!boardName.match(WordPattern)) {
            setWarning('Ви можете використовувати цифри, літери, пробіли, тире, крапки та нижні підкреслення!');
            return;
        }

        try {
            await api.post('/board', {
                title: boardName,
                custom: {
                    background: boardColor
                }
            });
            toast.success(`Дошку "${boardName}" успішно створено`);
            fetchDataAgain();
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Не вдалося створити нову дошку");
            closeModal();
        }
    };

    return <>
        <form className="modal-form" onSubmit={SubmitHandler}>
            <label>Назва:</label>
            <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)} />
        </form>
        <form className="modal-form">
            <label>Колір:</label>
            <input
                type="color"
                value={boardColor}
                onChange={(e) => setBoardColor(e.target.value)} />
        </form>
        <div className="warning">{warning}</div>
        <div className="buttons">
            <button onClick={() => postData()}>Створити дошку</button>
            <div className="btn-space"></div>
            <button onClick={() => closeModal()}>Закрити</button>
        </div>
    </>
}