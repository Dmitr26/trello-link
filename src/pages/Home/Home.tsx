import { useEffect, useState } from 'react';
import { Board } from '../Home/components/Board/Board';
import { ProgressBar } from '../Home/components/Progress/ProgressBar';
import { NoBoards } from './components/No-boards/NoBoards';
import { IBoard } from '../../common/interfaces/IBoard';
import { Modal } from '../../common/components/modals/Modal';
import { NewBoardModal } from '../../common/components/modals/home/NewBoardModal';
import { toast } from 'react-toastify';
import api from '../../api/request';
import './Home.scss';

export const Home = () => {

    const [boards, setBoards] = useState<IBoard[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [progressWidth, setprogressWidth] = useState(0);
    const [isProgressValue, setIsProgressValue] = useState(false);

    const fetchData = async (): Promise<void> => {
        try {
            const response = await api.get<IBoard[], { boards: IBoard[] }>('/board');
            setBoards(response.boards);
        } catch (error) {
            console.error(error);
            setIsProgressValue(false);
            toast.error("Не вдалося завантажити дошки");
        }
    };

    useEffect(() => {
        api.interceptors.request.use((config) => {
            setIsProgressValue(true);
            return config;
        });
        api.interceptors.response.use((response) => {
            setprogressWidth(95);
            setInterval(function () {
                setIsProgressValue(false);
            }, 2000);
            return response;
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const boardComponents = boards.map((board) => <Board
        key={board.id}
        id={board.id}
        title={board.title}
        custom={board.custom} />);

    return <div className="home">
        <div className='header'>
            <div className="title">Мої завдання</div>
            <button onClick={() => setIsModalOpen(true)}>Створити нову дошку завдання</button>
        </div>
        {isProgressValue && <ProgressBar barLength={progressWidth} />}
        <div className="boards">
            {!isProgressValue && boards.length !== 0 && boardComponents}
            {!isProgressValue && boards.length === 0 && <NoBoards />}
        </div>
        <Modal isOpen={isModalOpen}>
            <NewBoardModal onClose={() => setIsModalOpen(false)} fetchDataAgain={() => fetchData()} />
        </Modal>
    </div >
}