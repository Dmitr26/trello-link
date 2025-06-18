import { useEffect, useState } from 'react';
import { IList } from "../../../../common/interfaces/IList";
import { Card } from "../Card/Card";
import { Modal } from '../../../../common/components/modals/Modal';
import { NewCardModal } from '../../../../common/components/modals/board/NewCardModal';
import DraggableElement from '../../../../common/components/drag-drop/DraggableElement/DraggableElement';
import DropContainer from '../../../../common/components/drag-drop/DropContainer/DropContainer';
import CloseIcon from '../../../../common/icons/close_icon.svg';
import { DragStartHandler } from '../../../../common/components/drag-drop/DraggableElement/DraggableElementProps';
import { DragLeaveHandler } from '../../../../common/components/drag-drop/DraggableElement/DraggableElementProps';
import { DragEnterHandler } from '../../../../common/components/drag-drop/DraggableElement/DraggableElementProps';
import { DropHandler } from '../../../../common/components/drag-drop/DraggableElement/DraggableElementProps';
import classNames from 'classnames';
import api from '../../../../api/request';
import './List.scss';

interface IFetch extends IList {
    fetchData: () => any
}

export const List: React.FC<IFetch> = ({
    id,
    boardId,
    title,
    cards,
    fetchData,
    slots,
    changeSlots,
    singleSlot,
    changeSingleSlot,
    topOrBottom,
    setTopOrBottom
}) => {

    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [slotsToChange, setSlotsToChange] = useState<{ [id: string]: boolean[] }>(slots);
    const [dragStartSlot, setDragStartSlot] = useState(false);
    const [dragStartSlotPosition, setDragStartSlotPosition] = useState(0);
    const [slotToClose, setSlotToClose] = useState(0);

    const RemoveList = async () => {
        await api.delete('/board/' + boardId + '/list/' + id);
        fetchData();
    }

    const defineOrder = (
        under: number | undefined,
        topOffset: boolean,
        cardsInList: number | undefined,
        topBottom: boolean
    ): number => {
        let num = 0;

        if (!under) {
            if (!cardsInList) {
                num = 1;
            } else {
                num = topBottom ? cardsInList + 1 : 1;
            }
        } else {
            num = topOffset ? under : under + 1;
        }

        return num;
    }

    const resetSlotsToFalse = (slotArray: boolean[]): boolean[] => {
        let resetSlots = slotArray;
        resetSlots.map((_, i: number) => {
            return resetSlots[i] = false;
        });
        return resetSlots;
    }

    const HandleDragStart: DragStartHandler = ({ thisid, position }) => {
        if (thisid) {
            setDragStartSlot(true);
            setDragStartSlotPosition(position);
        }
    }

    const HandleDragLeave: DragLeaveHandler = ({ thisid }) => {
        if (thisid === 0) {
            setDragStartSlot(false);
            setDragStartSlotPosition(0);
        }
    }

    const HandleDragEnter: DragEnterHandler = ({ thisid, order, topOrBottomSlot }) => {

        if (thisid) {
            if (slots[thisid]) {

                if (slots[thisid].length === 0) {
                    singleSlot[thisid] = true;
                }

                setSlotToClose(Number(thisid));
                let slotToOpen = slotsToChange[thisid];
                if (typeof slotToOpen != "undefined") {
                    slotToOpen.map((_, i: number) => {
                        if (i === (Number(order) - 1)) {
                            return slotToOpen[i] = true;
                        } else {
                            return slotToOpen[i] = false;
                        }
                    });
                    changeSlots({ ...slots, [thisid]: slotToOpen });
                    setTopOrBottom(topOrBottomSlot);
                }
            }
        } else {

            Object.entries(singleSlot).map(([key]) => {
                if (singleSlot[key]) {
                    changeSingleSlot({ ...singleSlot, [key]: false });
                }
            })

            if (slotToClose !== 0) {
                let resetSlots = resetSlotsToFalse(slots[slotToClose]);
                changeSlots({ ...slots, [slotToClose]: resetSlots });
                setSlotToClose(0);
            }
        }
    }

    const HandleCardPositionChange: DropHandler = async ({
        dropContainerId,
        dragItemId,
        dragltemOrder,
        itemUnderDragItem,
        numberOfCards,
        topOffset,
        topOrBottom
    }) => {

        if (id === dropContainerId) {
            let resetSlots = resetSlotsToFalse(slotsToChange[id]);
            setSlotsToChange({ ...slotsToChange, [id]: resetSlots });
            setDragStartSlot(false);
            return;
        }

        cards.map(async (card) => {
            if (card.id === dragItemId) {
                await api.post('/board/' + boardId + '/card', {
                    title: card.title,
                    list_id: dropContainerId,
                    position: defineOrder(itemUnderDragItem, topOffset, numberOfCards, topOrBottom),
                    description: card.description,
                    custom: {
                        deadline: card.custom.deadline
                    }
                });
                await api.delete('/board/' + boardId + '/card/' + card.id);

                const updatedCardsList = cards
                    .filter((card) => card.id !== dragItemId)
                    .map((card) => ({
                        id: card.id,
                        position: card.position > Number(dragltemOrder) ? card.position - 1 : card.position,
                        list_id: id
                    }));

                console.log(updatedCardsList);

                try {
                    await api.put('/board/' + boardId + '/card', updatedCardsList);
                } catch (error) {
                    console.error("Error updating card positions:", error);
                }
                fetchData();
            }
        });
        setSlotToClose(0);
    }

    useEffect(() => {
        setSlotsToChange(slots);
    }, [slots]);

    const cardsComponents = cards.slice().sort((a, b) => a.position - b.position).map((card) => (
        <div className="card-with-slot" key={card.id}>
            <DraggableElement
                id={card.id}
                parentId={id}
                key={card.id}
                order={card.position}
                slots={slotsToChange}
                onDrop={HandleCardPositionChange}
                onDragStart={HandleDragStart}
                onDragLeave={HandleDragLeave}
                onDragEnter={HandleDragEnter} >
                {(props) => <div {...props} className={classNames('cardWrapper', props.className)}>
                    {Object.values(slotsToChange[id])[card.position - 1] && topOrBottom && <div className="slot"></div>}
                    <Card
                        key={card.id}
                        id={card.id}
                        listid={id}
                        position={card.position}
                        title={card.title}
                        description={card.description}
                        custom={card.custom}
                        cardData={card} />
                    {Object.values(slotsToChange[id])[card.position - 1] && !topOrBottom && <div className="slot"></div>}
                </div>}
            </DraggableElement>
            {dragStartSlot && (card.position === dragStartSlotPosition) && <div className="slot"></div>}
        </div>));

    return <div className="list">
        <div className="list-body">
            <div className="listTop">
                <div className="listTitle">{title}</div>
                <div>
                    <img
                        className="deleteIcon"
                        src={CloseIcon}
                        style={{ height: 22, width: 22, cursor: 'pointer' }}
                        alt="No img"
                        onClick={RemoveList} />
                </div>
            </div>

            <DropContainer id={id} key={id}>
                {(props) => (
                    <div {...props} className={classNames('listContent', props.className)}>
                        {singleSlot[id] && <div className="slot"></div>}
                        <div className="cardsArea">
                            {cardsComponents}
                        </div>
                    </div>
                )}
            </DropContainer>
            <button onClick={() => setIsCardModalOpen(true)} onDragOver={(e) => { console.log(e) }}>Додати картку...</button>
        </div>

        <Modal isOpen={isCardModalOpen}>
            <NewCardModal
                id={boardId}
                numberOfCards={cards.length + 1}
                listid={id}
                onClose={() => setIsCardModalOpen(false)}
                fetchDataAgain={() => fetchData()} />
        </Modal>
    </div>
}