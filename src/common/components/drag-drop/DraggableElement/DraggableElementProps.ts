import { PointerEventHandler, ReactElement, RefObject } from "react";

export interface ChildrenProps {
    'data-drag-item': number,
    'data-item-order': string,
    className?: string
    ref?: RefObject<any>,
    onPointerDown?: PointerEventHandler<HTMLElement>
}

export type DragStartHandler = (data: {
    thisid: number,
    position: number
}) => void;

export type DragLeaveHandler = (data: {
    thisid: number | null
}) => void;

export type DragEnterHandler = (data: {
    thisid: number | null,
    order: number | null,
    topOrBottomSlot: boolean
}) => void;

export type DropHandler = (data: {
    dropContainerId: number | null,
    dragItemId: number,
    dragltemOrder: number | null,
    numberOfCards: number | undefined,
    itemUnderDragItem: number | undefined,
    topOffset: boolean,
    topOrBottom: boolean
}) => void;

interface Props {
    id: number,
    parentId: number,
    order: number,
    slots: { [id: string]: boolean[] },
    onDragStart?: DragStartHandler,
    onDragLeave?: DragLeaveHandler,
    onDragEnter?: DragEnterHandler,
    onDrop?: DropHandler,
    children: (props: ChildrenProps) => ReactElement<any, any> | null
}

export default Props;