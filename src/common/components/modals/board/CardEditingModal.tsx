import { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch } from "react-redux";
import { ICard } from "../../../interfaces/ICard";
import { IList } from "../../../interfaces/IList";
import { closeModal } from "../../../store/modalSlice";
import { fetchBoardData } from "../../../store/modalSlice";
import api from '../../../../api/request';
import { Modal } from "../Modal";
import { CardChangePositionModal } from "./CardChangePositionModal";
import { WordPattern } from "../../../WordPattern";

interface BoardNameChangeProps {
    isEditModalOpen: boolean;
    cardData: ICard | null;
    listsData: IList[];
}

export const CardEditingModal: React.FC<BoardNameChangeProps> = ({ isEditModalOpen, cardData, listsData }) => {

    const postTextAreaId = useId();
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dataToEdit, setDataToEdit] = useState(cardData);
    const [cardName, setCardName] = useState<string>("");
    const [cardDescription, setCardDescription] = useState("");
    const [cardDeadline, setCardDeadline] = useState("");
    const [cardId, setCardId] = useState(0);
    const [listId, setListId] = useState(0);
    const [warning, setWarning] = useState<string>('');
    const [isMoveCardModalOpen, setIsMoveCardModalOpen] = useState(false);

    const serializedState = localStorage.getItem('data');
    const parsedSerializedState = serializedState ? JSON.parse(serializedState) : null;

    const saveState = (isOpen: boolean) => {
        try {
            const serializedState = JSON.stringify(isOpen);
            const serializedData = JSON.stringify(cardData);
            localStorage.setItem('state', serializedState);
            localStorage.setItem('data', serializedData);
        } catch (e) {
            // Ignore write errors;
        }
    }

    const returnInitialData = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            if (cardData) {
                setCardName(cardData.title);
                setCardDescription(cardData.description);
                setCardDeadline(cardData.custom.deadline);
            }
        }
    };

    const changeDataToEdit = (newData: string, key: string) => {
        if (dataToEdit) {
            if (key === "deadline") {
                setDataToEdit({ ...dataToEdit, custom: { [key]: newData } });
            } else {
                setDataToEdit({ ...dataToEdit, [key]: newData });
            }
        }
        const serializedData = JSON.stringify(cardData);
        localStorage.setItem('data', serializedData);
    }

    const closeEditingModal = () => {
        dispatch(closeModal());
        setWarning('');
        navigate(`/board/${dataToEdit?.parentId}`);
        localStorage.removeItem('state');
        localStorage.removeItem('data');
    };

    const updateData = async () => {

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

        await api.put('/board/' + params.board_id + '/card/' + cardId, {
            title: cardName,
            description: cardDescription,
            custom: {
                deadline: cardDeadline
            },
            list_id: listId
        });

        dispatch<any>(fetchBoardData(String(params.board_id)));
        closeEditingModal();
    }

    const deleteCard = async () => {
        await api.delete('/board/' + params.board_id + '/card/' + cardId);

        let oldPosition = cardData?.position;
        let parentCardList: ICard[] = [];

        listsData.map((list) => {
            if (list.id === cardData?.listid) {
                parentCardList = list.cards;
            }
        })

        const updatedCardsList = parentCardList
            .filter((card) => card.id !== cardData?.id)
            .map((card) => ({
                id: card.id,
                position: card.position > Number(oldPosition) ? card.position - 1 : card.position,
                list_id: cardData?.listid
            }));

        try {
            await api.put('/board/' + cardData?.parentId + '/card', updatedCardsList);
        } catch (error) {
            console.error("Error updating card positions:", error);
        }

        dispatch<any>(fetchBoardData(String(params.board_id)));
        closeEditingModal();
    }

    const openMoveCardModal = () => {
        setIsMoveCardModalOpen(true);
    }

    useEffect(() => {
        if (isEditModalOpen) {
            saveState(isEditModalOpen);
        }
        if (dataToEdit) {
            setCardName(dataToEdit.title);
            setCardDescription(dataToEdit.description);
            setCardDeadline(dataToEdit.custom.deadline);
            setCardId(dataToEdit.id);
            setListId(dataToEdit.listid);
        }
        if (parsedSerializedState) {
            setDataToEdit(parsedSerializedState);
            setCardName(parsedSerializedState.title);
            setCardDescription(parsedSerializedState.description);
            setCardDeadline(parsedSerializedState.custom.deadline);
            setCardId(parsedSerializedState.id);
            setListId(parsedSerializedState.listid);
        }
    }, []);

    useEffect(() => {
        const serializedData = JSON.stringify(dataToEdit);
        localStorage.setItem('data', serializedData);
    }, [dataToEdit]);

    return <>
        <form className="modal-form">
            <label>Назва:</label>
            <input
                className="name-input editing"
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                onBlur={(e) => changeDataToEdit(e.target.value, "title")}
                onKeyDownCapture={(e) => returnInitialData(e)} />
        </form>
        <div className="label-margin"><label className="description-label" htmlFor={postTextAreaId}>Опис:</label></div>
        <textarea
            id={postTextAreaId}
            className="description-field"
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            onBlur={(e) => changeDataToEdit(e.target.value, "description")} />
        <form className="modal-form">
            <label>Дедлайн:</label>
            <input
                className="deadline-input"
                type="datetime-local"
                value={cardDeadline}
                onChange={(e) => setCardDeadline(e.target.value)}
                onBlur={(e) => changeDataToEdit(e.target.value, "deadline")} />
        </form>
        <div className="warning">{warning}</div>
        <div className="buttons">
            <button onClick={updateData}>Змінити дані</button>
            <div className="btn-space"></div>
            <button onClick={openMoveCardModal}>Перемістити картку</button>
            <div className="btn-space"></div>
            <button onClick={deleteCard}>Видалити картку</button>
            <div className="btn-space"></div>
            <button onClick={closeEditingModal}>Закрити</button>
        </div>

        <Modal isOpen={isMoveCardModalOpen}>
            <CardChangePositionModal listsData={listsData} cardData={cardData} onClose={() => setIsMoveCardModalOpen(false)} />
        </Modal>
    </>
}