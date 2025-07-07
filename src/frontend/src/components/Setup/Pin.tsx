import React from 'react';

interface PinProps {
  adminPin: string;
  setAdminPin: (pin: string) => void;
  onNext: () => void;
}

const Pin: React.FC<PinProps> = ({ adminPin, setAdminPin, onNext }) => {
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
      <button onClick={onNext}>Next</button>
    </div>
  );
};

export default Pin;
