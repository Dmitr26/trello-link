export interface ICard {
    id: number,
    listid: number,
    position: number,
    title: string,
    description: string,
    custom: {
        deadline: string
    },
    parentId?: number
}