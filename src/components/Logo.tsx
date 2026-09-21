import React from 'react';
import styles from './Logo.module.css';

export default function Logo() {
    return (
        <div className={styles.container}>
            <img
                src="/Logo 1.png"
                alt="Chique Detalhes Official Logo"
                className={styles.logoImage}
                style={{ width: 'auto', height: 'auto', maxWidth: '200px' }}
            />

        </div>
    );
}
