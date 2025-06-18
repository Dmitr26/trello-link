import { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { IBoard } from '../../common/interfaces/IBoard';
import { IList } from '../../common/interfaces/IList';
import { ReactComponent as EditIcon } from '../../common/icons/edit_icon.svg';
import { ReactComponent as BGIcon } from '../../common/icons/background_icon.svg';
import { List } from './components/List/List';
import { Modal } from '../../common/components/modals/Modal';
import { BoardNameChangeModal } from '../../common/components/modals/board/BoardNameChangeModal';
import { BoardBackgroundChangeModal } from '../../common/components/modals/board/BoardBackgroundChangeModal';
import { NewListModal } from '../../common/components/modals/board/NewListModal';
import { CardEditingModal } from '../../common/components/modals/board/CardEditingModal';
import { RootState } from '../../common/store/store';
import { toast } from 'react-toastify';
import api from '../../api/request';
import './Board.scss';

export const Board = () => {

    const params = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
    const [lists, setLists] = useState<IList[]>([]);
    const [boardData, setBoardData] = useState({
        title: "",
        backgroundColor: "#ffffff",
        backgroundImage: ""
    });
    const [slotPositions, setSlotPositions] = useState<{ [id: string]: boolean[] }>({});
    const [singleSlot, setSingleSlot] = useState<{ [id: string]: boolean }>({});
    const [topOrBottom, setTopOrBottom] = useState(false);

    const { isEditModalOpen, cardData, boardsData } = useSelector((state: RootState) => state.modal);

    const serializedState = localStorage.getItem('state');
    const parsedSerializedState = serializedState ? JSON.parse(serializedState) : null;

    const changeSlotState = (data: { [id: string]: boolean[] }) => {
        setSlotPositions(data);
    }

    const changeEmptySlotState = (data: { [id: string]: boolean }) => {
        setSingleSlot(data);
    }

    const setTopOrBottomOfCard = (data: boolean) => {
        setTopOrBottom(data);
    }

    const createSlotPositions = (lists: IList[]) => {
        if (lists) {
            const arr = {};

            const listsmap = lists.map((list) => {
                return ({
                    [list.id]: list.cards.map(() => false)
                })
            });

            for (let i = 0; i < listsmap.length; i++) {
                Object.assign(arr, listsmap[i]);
            }

            setSlotPositions(arr);
        }
    }

    const createSingleSlots = (lists: IList[]) => {
        if (lists) {
            const singleArr = {};

            const singleSlots = lists.map((list) => {
                return ({
                    [list.id]: false
                })
            });

            for (let i = 0; i < singleSlots.length; i++) {
                Object.assign(singleArr, singleSlots[i]);
            }

            setSingleSlot(singleArr);
        }
    }

    const setListsWithSlots = (lists: IList[]) => {
        setLists(lists);
        createSlotPositions(lists);
        createSingleSlots(lists);
    }

    const fetchData = async () => {
        try {
            const response = await api.get<{ title: string, lists: IList[] }, IBoard>('/board/' + params.board_id);

            setBoardData({
                title: response.title,
                backgroundColor: response.custom.background,
                backgroundImage: response.custom.backgroundImage !== undefined ? response.custom.backgroundImage : ""
            });

            if (typeof response.lists !== 'undefined') {
                setListsWithSlots(response.lists);
            }

            toast.success(`Вітаємо на дошці ${response.title}`);
        } catch (error) {
            console.error(error);
            toast.error("Не вдалося завантажити цю дошку");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (boardsData?.lists) {
            setListsWithSlots(boardsData.lists);
        }
    }, [boardsData]);

    const listComponents = lists.slice().sort((a, b) => a.position - b.position).map((list) => <List
        key={list.id}
        id={list.id}
        boardId={params.board_id}
        position={list.position}
        title={list.title}
        cards={list.cards}
        slots={slotPositions}
        changeSlots={changeSlotState}
        singleSlot={singleSlot}
        changeSingleSlot={changeEmptySlotState}
        topOrBottom={topOrBottom}
        setTopOrBottom={setTopOrBottomOfCard}
        fetchData={() => fetchData()} />);

    return <div className="board" style={{
        backgroundColor: boardData.backgroundColor,
        backgroundImage: boardData.backgroundImage !== "" ? `url(${boardData.backgroundImage})` : undefined,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
    }}>
        <div className='header'>
            <div className="title">{boardData.title + ' '}
                <button className="edit" onClick={() => setIsModalOpen(true)}><EditIcon /></button>
                <button className="edit" onClick={() => setIsBackgroundModalOpen(true)}><BGIcon /></button>
            </div>
            <button onClick={() => setIsListModalOpen(true)}>Створити новий список</button>
        </div>
        <div className="lists">
            {listComponents}
        </div>

        <Modal isOpen={isModalOpen}>
            <BoardNameChangeModal
                titleToChange={boardData.title}
                onClose={() => setIsModalOpen(false)}
                fetchDataAgain={() => fetchData()} />
        </Modal>

        <Modal isOpen={isBackgroundModalOpen}>
            <BoardBackgroundChangeModal
                bgColorToChange={boardData.backgroundColor}
                onClose={() => setIsBackgroundModalOpen(false)}
                fetchDataAgain={() => fetchData()} />
        </Modal>

        <Modal isOpen={isListModalOpen}>
            <NewListModal
                id={params.board_id}
                numberOfLists={lists.length + 1}
                onClose={() => setIsListModalOpen(false)}
                fetchDataAgain={() => fetchData()} />
        </Modal>

        <Modal isOpen={isEditModalOpen || parsedSerializedState}>
            <CardEditingModal isEditModalOpen={isEditModalOpen} cardData={cardData} listsData={lists} />
        </Modal>
    </div>
}