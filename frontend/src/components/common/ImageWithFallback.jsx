import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export default function ImageWithFallback({ src, fallbackSrc, alt, component = 'img', ...props }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (!hasError && fallbackSrc) {
            setImgSrc(fallbackSrc);
            setHasError(true);
        }
    };

    return (
        <Box
            component={component}
            src={imgSrc}
            alt={alt}
            onError={handleError}
            {...props}
        />
    );
}
