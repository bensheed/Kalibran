import React, { useState } from 'react';

interface PinProps {
  adminPin: string;
  setAdminPin: (pin: string) => void;
  onNext: () => void;
}

const Pin: React.FC<PinProps> = ({ adminPin, setAdminPin, onNext }) => {
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (adminPin.length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }
    if (adminPin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div>
      <h2>Step 1: Create Admin PIN</h2>
      <input
        type="password"
        value={adminPin}
        onChange={(e) => setAdminPin(e.target.value)}
        placeholder="Enter a 4-digit PIN"
        maxLength={4}
      />
      <input
        type="password"
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value)}
        placeholder="Confirm your 4-digit PIN"
        maxLength={4}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleNext} disabled={!adminPin || !confirmPin}>
        Next
      </button>
    </div>
  );
};

export default Pin;
