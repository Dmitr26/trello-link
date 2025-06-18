import { useId, useState } from 'react';
import { SubmitHandler } from '../../../SubmitHandler';
import { WordPattern } from '../../../WordPattern';
import { toast } from 'react-toastify';
import api from '../../../../api/request';

interface NewCardModalProps {
    id: string | undefined,
    listid: number,
    numberOfCards: number,
    onClose: () => void,
    fetchDataAgain: () => void
}

export const NewCardModal: React.FC<NewCardModalProps> = ({ id, listid, numberOfCards, onClose, fetchDataAgain }) => {

    const postTextAreaId = useId();
    const [warning, setWarning] = useState<string>('');
    const [cardName, setCardName] = useState<string>('');
    const [cardDescription, setCardDescription] = useState<string>('');
    const [cardDeadline, setCardDeadline] = useState<string>('');

    const closeModal = () => {
        setCardName('');
        setCardDescription('');
        setCardDeadline('');
        setWarning('');
        onClose();
    }

    const postData = async () => {
        if (cardName === '') {
            setWarning('Будь ласка, вкажіть назву для картки!');
            return;
        }

        if (!cardName.match(WordPattern)) {
            setWarning('Ви можете використовувати цифри, літери, пробіли, тире, крапки та нижні підкреслення!');
            return;
        }

        if (cardDescription === '') {
            setWarning('Будь ласка, додайте опис для картки!');
            return;
        }

        if (cardDeadline === '') {
            setWarning('Будь ласка, вкажіть дедлайн для картки!');
            return;
        }

        try {
            await api.post('/board/' + id + '/card', {
                title: cardName,
                list_id: listid,
                position: numberOfCards,
                description: cardDescription,
                custom: {
                    deadline: cardDeadline.replace(/T/g, ' ')
                }
            });
            toast.success(`Картку "${cardName}" успішно створено`);
            fetchDataAgain();
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Не вдалося створити нову картку");
            closeModal();
        }
    }

    return <>
        <form className="modal-form" onSubmit={SubmitHandler}>
            <label>Назва:</label>
            <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} />
        </form>
        <div className="label-margin"><label className="description-label" htmlFor={postTextAreaId}>Опис:</label></div>
        <textarea
            id={postTextAreaId}
            className="description-field"
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)} />
        <form className="modal-form" onSubmit={SubmitHandler}>
            <label>Дедлайн:</label>
            <input
                type="datetime-local"
                value={cardDeadline}
                onChange={(e) => setCardDeadline(e.target.value)} />
        </form>
        <div className="warning">{warning}</div>
        <div className="buttons">
            <button onClick={() => postData()}>Створити картку</button>
            <div className="btn-space"></div>
            <button onClick={() => closeModal()}>Закрити</button>
        </div>
    </>
}