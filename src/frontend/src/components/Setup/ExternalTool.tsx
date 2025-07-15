import React from 'react';

interface ExternalToolProps {
  dbType: string;
  setDbType: (type: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ExternalTool: React.FC<ExternalToolProps> = ({ dbType, setDbType, onNext, onBack }) => {
  return (
    <div>
      <h2>Step 2: Select External Tool</h2>
      <select value={dbType} onChange={(e) => setDbType(e.target.value)}>
        <option value="ProCal">ProCal</option>
        <option value="MetCal" disabled>MetCal (coming soon)</option>
        <option value="IndySoft" disabled>IndySoft (coming soon)</option>
      </select>
      <button onClick={onBack}>Back</button>
      <button onClick={onNext}>Next</button>
    </div>
  );
};

export default ExternalTool;
