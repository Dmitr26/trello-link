import { ReactElement } from "react";

export interface ChildrenProps {
    className?: string,
    'data-drop-container': number
}

interface Props {
    id: number,
    children: (props: ChildrenProps) => ReactElement<any, any> | null
}

export default Props;