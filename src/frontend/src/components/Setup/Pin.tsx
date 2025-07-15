import React, { useState } from 'react';

interface PinProps {
  adminPin: string;
  setAdminPin: (pin: string) => void;
  confirmPin: string;
  setConfirmPin: (pin: string) => void;
  onNext: () => void;
  error: string;
}

const Pin: React.FC<PinProps> = ({ adminPin, setAdminPin, confirmPin, setConfirmPin, onNext, error }) => {
  return (
    <div>
      <h2>Step 1: Create Admin PIN</h2>
      <input
        type="password"
        value={adminPin}
        onChange={(e) => setAdminPin(e.target.value)}
        placeholder="Enter a PIN (min 4 digits)"
      />
      <input
        type="password"
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value)}
        placeholder="Confirm your PIN"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onNext} disabled={!adminPin || !confirmPin}>
        Next
      </button>
    </div>
  );
};

export default Pin;
