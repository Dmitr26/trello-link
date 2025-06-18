import { useState } from 'react';
import { useParams } from "react-router";
import { SubmitHandler } from '../../../SubmitHandler';
import { WordPattern } from '../../../WordPattern';
import { toast } from 'react-toastify';
import api from '../../../../api/request';

interface BoardNameChangeProps {
    titleToChange: string,
    onClose: () => void,
    fetchDataAgain: () => void
}

export const BoardNameChangeModal: React.FC<BoardNameChangeProps> = ({ titleToChange, onClose, fetchDataAgain }) => {

    const params = useParams();
    const [newTitle, setNewTitle] = useState<string>(titleToChange);
    const [warning, setWarning] = useState<string>('');

    const saveData = async (value: string) => {
        setNewTitle(value);
    }

    const postData = async (data: string) => {

        if (!data.match(WordPattern)) {
            setWarning('Ви можете використовувати цифри, літери, пробіли, тире, крапки та нижні підкреслення!');
            return;
        }

        if (data !== '') {
            try {
                console.log(data);
                await api.put('/board/' + params.board_id, {
                    title: data
                });
                fetchDataAgain();
                toast.success("Назву дошки змінено");
                setWarning('');
                onClose();
            } catch (error) {
                console.error(error);
                toast.error("Назву дошки не вдалося змінити");
                onClose();
            }
        } else {
            setWarning('Будь ласка, вкажіть назву для дошки!');
        }
    }

    const postDataByEnter = async (key: string) => {
        if (key === 'Enter') {
            postData(newTitle);
        }
    }

    const postDataOnBlur = async (e: string) => {
        postData(e);
    }

    return <>
        <form className="edit-form" onSubmit={SubmitHandler}>
            <input type="text" defaultValue={newTitle}
                onChange={(e) => saveData(e.target.value)}
                onKeyDown={(e) => postDataByEnter(e.key)}
                onBlur={(e) => postDataOnBlur(e.target.value)}
            />
        </form>
        <div className="warning-top">{warning}</div>
    </>
}