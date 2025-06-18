import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch } from "react-redux";
import Markdown from "react-markdown";
import { ICard } from "../../../../common/interfaces/ICard"
import { openModal } from "../../../../common/store/modalSlice";
import SettingIcon from '../../../../common/icons/edit_icon.svg';
import './Card.scss';

interface IFetch extends ICard {
    cardData: ICard
}

export const Card: React.FC<IFetch> = ({ id, title, description, custom, cardData, listid }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const [editableData, setEditableData] = useState(cardData);

    const openEditingModal = () => {
        navigate('/board/' + params.board_id + '/card/' + id);
        dispatch(openModal({ cardData: editableData }));
    }

    useEffect(() => {
        setEditableData({ ...cardData, ["parentId"]: Number(params.board_id), ["listid"]: listid });
    }, [cardData]);

    return <div className="card" draggable={true} >
        <div className="cardTop">
            <div className="cardTitle">{title}</div>
            <div>
                <img className="deleteIcon" src={SettingIcon} style={{ height: 25, width: 25, cursor: 'pointer' }} alt="No img" onClick={openEditingModal} />
            </div>
        </div>
        <div className="cardDescription"><Markdown>{description}</Markdown></div>
        <div className="CardDeadline"> <span className="ddln">Дедлайн:</span> {custom.deadline}</div>
    </div>
}