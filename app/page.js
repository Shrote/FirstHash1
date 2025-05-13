"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}