import { Link } from 'react-router-dom';
import { IBoard } from "../../../../common/interfaces/IBoard"
import './Board.scss';

export const Board: React.FC<IBoard> = ({ id, title, custom }) => {
    return <Link className="board-link" to={"/board/" + id} >
        <div className="task-board" style={{ backgroundColor: custom.background }}>{title}</div>
    </Link>
}