import React from 'react';
import defaultIcon from './icons8-info-64.png';
import propType from 'prop-types';

export default function ImgToIcon( {src, uri, size, alt, ...otherProps}) {
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

ImgToIcon.defaultProps = {
    src: '', 
    uri: '', 
    size: 20,
};

ImgToIcon.propTypes = {
    size: propType.number,
    src: propType.string,
    uri: propType.string,
};
