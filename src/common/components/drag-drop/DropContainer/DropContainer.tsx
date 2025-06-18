import { FC } from "react";
import Props from "./DropContainerProps";

const DropContainer: FC<Props> = ({ id, children }) => {

    return children({
        'data-drop-container': id
    });
}

export default DropContainer;