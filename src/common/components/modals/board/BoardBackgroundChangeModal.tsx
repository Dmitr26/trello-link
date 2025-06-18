import { useState } from 'react';
import { useParams } from "react-router";
import { toast } from 'react-toastify';
import api from '../../../../api/request';

interface BoardNameChangeProps {
    bgColorToChange: string,
    onClose: () => void,
    fetchDataAgain: () => void
}

export const BoardBackgroundChangeModal: React.FC<BoardNameChangeProps> = ({ bgColorToChange, onClose, fetchDataAgain }) => {

    const params = useParams();
    const [backgroundColor, setBackgroundColor] = useState<string>(bgColorToChange);
    const [backgroundImage, setBackgroundImage] = useState<string>('');

    const getBase64 = (file: Blob) => {
        console.log(file);
        let reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.onload = async function () {
                setBackgroundImage(reader.result as string);
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
    }

    const postData = async () => {
        try {
            await api.put('/board/' + params.board_id, {
                custom: {
                    background: backgroundColor,
                    backgroundImage: backgroundImage
                }
            });
            fetchDataAgain();
            toast.success("Стиль дошки змінено");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Стиль дошки не вдалося змінити");
            onClose();
        }
    }

    return <>
        <form className="modal-form">
            <label>Колір:</label>
            <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)} />
        </form>
        <div className="info">{"Ви можете завантажити на сайт картинку та використовувати її як фоновий малюнок. Не завантажуйте зображення занадто великого розміру або зображення з високою роздільною здатністю (сайт може не прийняти таку картинку)!"}</div>
        <form className="modal-form">
            <label>Зображення:</label>
            <input
                type="file"
                className="img-input"
                onChange={(event) => { if (event.target.files) getBase64(event.target.files[0]) }}
            />
        </form>
        <div className="buttons">
            <button onClick={() => postData()}>Змінити колір</button>
            <button onClick={() => onClose()}>Закрити</button>
        </div>
    </>
}