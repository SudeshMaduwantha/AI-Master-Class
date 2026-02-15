'use client';

import { signIn } from 'next-auth/react';
import GlassCard from '@/components/GlassCard';
import { motion } from 'framer-motion';

export default function LoginPage() {
    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <GlassCard className="glass-login">
                    <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem' }}>Welcome Back</h1>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Sign in to access your Class Recordings
                    </p>

                    <button
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    >
                        <img src="https://authjs.dev/img/providers/google.svg" alt="Google" width="20" height="20" />
                        Sign in with Google
                    </button>
                </GlassCard>
            </motion.div>
        </div>
    );
}
