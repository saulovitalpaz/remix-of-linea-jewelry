import React from 'react';
import styles from './Logo.module.css';

export default function Logo() {
    return (
        <div className={styles.container}>
            <img
                src="/Gemini_Generated_Image_idjs8midjs8midjs.png"
                alt="Chique Detalhes Official Logo"
                className={styles.logoImage}
                style={{ width: 'auto', height: 'auto', maxWidth: '200px' }}
            />
        </div>
    );
}
