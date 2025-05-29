import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password, username);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'signin' ? 'Sign In' : 'Sign Up'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 border rounded" />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full px-3 py-2 border rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full px-3 py-2 border rounded" />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" disabled={isLoading} className="w-full px-4 py-2 bg-[#6C4DFF] text-white rounded">{isLoading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}</button>
      </form>
      <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="mt-4 text-sm text-[#6C4DFF] hover:underline">
        {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </Modal>
  );
};

export default AuthModal; 