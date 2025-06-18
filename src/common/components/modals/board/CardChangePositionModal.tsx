import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch } from "react-redux";
import { IList } from "../../../interfaces/IList";
import { ICard } from "../../../interfaces/ICard";
import { fetchBoardData, closeModal } from "../../../../common/store/modalSlice";
import api from '../../../../api/request';

interface NewCardModalProps {
    listsData: IList[],
    cardData: ICard | null,
    onClose: () => void
}

export const CardChangePositionModal: React.FC<NewCardModalProps> = ({ listsData, cardData, onClose }) => {

    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [newListId, setNewListId] = useState(0);
    const [positions, setPositions] = useState(0);
    const [newPosition, setNewPosition] = useState(0);
    const [positionNumbers, setPositionNumbers] = useState<number[]>([]);
    const [warning, setWarning] = useState<string>('');

    const closeChangePositionModal = () => {
        setWarning('');
        onClose();
    }

    const replaceCard = async () => {
        if (newListId !== 0 && newPosition !== 0) {
            await api.post('/board/' + cardData?.parentId + '/card', {
                title: cardData?.title,
                list_id: newListId,
                position: newPosition,
                description: cardData?.description,
                custom: {
                    deadline: cardData?.custom.deadline
                }
            });
            await api.delete('/board/' + cardData?.parentId + '/card/' + cardData?.id);

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
            setWarning('');
            onClose();
            dispatch(closeModal());
            navigate(`/board/${cardData?.parentId}`);
            localStorage.removeItem('state');
            localStorage.removeItem('data');
        } else {
            setWarning('Будь ласка, вкажіть назву дошки та позицію картки!');
        }
    }

    const findListId = (listName: string) => {
        listsData.map((list) => {
            if (list.title === listName) {
                setNewListId(list.id);
                setPositions(list.cards.length);
            }
        });
    }

    const listOptions = listsData.slice().sort((a, b) => a.position - b.position).map((list) => (
        <option key={list.title} value={list.title}>{list.title}</option>
    ));

    useEffect(() => {
        let nums = [];

        for (let i = 0; i < positions + 1; i++) {
            nums.push(i);
        }

        setPositionNumbers(nums);
    }, [positions]);

    return <>
        <div className="select-n-label">
            <label htmlFor="lists">Виберіть список:</label>
            <select name="lists" id="lists" className="select-form" onChange={(e) => findListId(e.target.value)}>
                <option key={0} value={0}>Списки</option>
                {listOptions}
            </select>
        </div>
        <div className="select-n-label">
            <label htmlFor="positions">Виберіть позицію картки:</label>
            <select name="positions" id="positions" className="select-form" onChange={(e) => setNewPosition(Number(e.target.value))}>
                <option key={0} value={0}>Позиції</option>
                {positionNumbers && positionNumbers.map((number) => (
                    <option key={number + 1} value={number + 1}>{number + 1}</option>
                ))}
            </select>
        </div>
        <div className="warning">{warning}</div>
        <div className="buttons">
            <button onClick={() => replaceCard()}>Перемістити</button>
            <div className="btn-space"></div>
            <button onClick={() => closeChangePositionModal()}>Закрити</button>
        </div>
    </>
}