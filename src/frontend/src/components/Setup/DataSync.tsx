import React from 'react';

interface DataSyncProps {
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const DataSync: React.FC<DataSyncProps> = ({ onBack, onSubmit, loading }) => {
  return (
    <div>
      <h2>Step 4: Data Sync</h2>
      <p>Configure data sync settings here.</p>
      <button onClick={onBack}>Back</button>
      <button onClick={onSubmit} disabled={loading}>
        {loading ? 'Completing...' : 'Complete Setup'}
      </button>
    </div>
  );
};

export default DataSync;
