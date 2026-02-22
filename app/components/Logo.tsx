import React from 'react';
import Image from 'next/image';
import styles from './Logo.module.css';

export default function Logo() {
    return (
        <div className={styles.container}>
            <Image
                src="/Gemini_Generated_Image_idjs8midjs8midjs.png"
                alt="Chique Detalhes Official Logo"
                width={300}
                height={100}
                className={styles.logoImage}
                style={{ width: 'auto', height: 'auto' }}
                priority
            />
        </div>
    );
}
