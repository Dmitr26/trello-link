import { useState } from 'react';
import { SubmitHandler } from '../../../SubmitHandler';
import { WordPattern } from '../../../WordPattern';
import { toast } from 'react-toastify';
import api from '../../../../api/request';

interface NewListModalProps {
    id: string | undefined,
    numberOfLists: number,
    onClose: () => void,
    fetchDataAgain: () => void
}

export const NewListModal: React.FC<NewListModalProps> = ({ id, numberOfLists, onClose, fetchDataAgain }) => {

    const [warning, setWarning] = useState<string>('');
    const [listName, setListName] = useState<string>('');

    const closeModal = () => {
        setListName('');
        setWarning('');
        onClose();
    }

    const postData = async () => {
        if (listName === '') {
            setWarning('Будь ласка, вкажіть назву для списка!');
            return;
        }

        if (!listName.match(WordPattern)) {
            setWarning('Ви можете використовувати цифри, літери, пробіли, тире, крапки та нижні підкреслення!');
            return;
        }

        try {
            await api.post('/board/' + id + '/list', {
                title: listName,
                position: numberOfLists
            });
            toast.success(`Список "${listName}" успішно створено`);
            fetchDataAgain();
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Не вдалося створити новий список");
            closeModal();
        }
    }

    return <>
        <form className="modal-form" onSubmit={SubmitHandler}>
            <label>Назва:</label>
            <input type="text" value={listName} onChange={(e) => setListName(e.target.value)} />
        </form>
        <div className="warning">{warning}</div>
        <div className="buttons">
            <button onClick={() => postData()}>Створити список</button>
            <div className="btn-space"></div>
            <button onClick={() => closeModal()}>Закрити</button>
        </div>
    </>
}