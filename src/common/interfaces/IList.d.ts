import { ICard } from "./ICard";

export interface IList {
    id: number,
    boardId: string | undefined,
    position: number,
    title: string,
    cards: ICard[],
    slots: { [id: string]: boolean[] },
    changeSlots: (data: { [id: string]: boolean[] }) => void,
    singleSlot: { [id: string]: boolean },
    changeSingleSlot: (data: { [id: string]: boolean }) => void,
    topOrBottom: boolean,
    setTopOrBottom: (data: boolean) => void
}