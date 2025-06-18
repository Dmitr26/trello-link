import { IList } from "./IList";

export interface IBoard {
    id: number,
    title: string,
    custom: {
        background: string,
        backgroundImage?: string;
    },
    lists?: IList[];
}