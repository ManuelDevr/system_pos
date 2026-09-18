import React from 'react';
import Logo from '@/Assets/Logo.jpg';

export default function ApplicationLogo(props) {
    return (
        <img 
            {...props} 
            src={Logo} 
            alt="Logo Ferretería CMA" 
            className={`${props.className} object-contain rounded-lg`} 
        />
    );
}
