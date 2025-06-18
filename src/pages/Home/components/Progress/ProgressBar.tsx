import { useEffect, useState } from 'react';
import './ProgressBar.scss';

interface ProgressBarProps {
    barLength: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ barLength }) => {

    const [progressWidth, setprogressWidth] = useState(0);

    useEffect(() => {
        requestAnimationFrame(() => {
            if (progressWidth < barLength) {
                setprogressWidth(progressWidth + 1);
            }
        });
    });

    return <div className="progress-bar" style={{ "--width": progressWidth } as React.CSSProperties}></div>
}