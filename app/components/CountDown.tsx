'use client';
import { useEffect, useState } from 'react';
import styles from '../css/CountDown.module.css';

interface Props {
  targetDate: string; // ISO format
}

export default function CountdownTimer({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const end = new Date(targetDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    update(); // init
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={styles.timer}>
      <span>{timeLeft.d}d</span>
      <span>{timeLeft.h}h</span>
      <span>{timeLeft.m}m</span>
      <span>{timeLeft.s}s</span>
    </div>
  );
}
