import React from 'react';
import defaultIcon from '@/icons/icons8-info-64.png';

interface ImgToIconProps {
    src?: string;
    uri?: string;
    size?: number;
    alt?: string;
    [key: string]: any;
}

export default function ImgToIcon( {src = '', uri = '', size = 20, alt, ...otherProps}: ImgToIconProps) {
    const srcUrl = src || uri || defaultIcon;
    return (
        <React.Fragment>
            <img
                src={srcUrl}
                height={size}
                width={size}
                {...otherProps}
                alt={alt || srcUrl}
            />
        </React.Fragment>
    );
}
