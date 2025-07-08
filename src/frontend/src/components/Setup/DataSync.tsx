import React, { useState } from 'react';

interface DataSyncProps {
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const DataSync: React.FC<DataSyncProps> = ({ onBack, onSubmit, loading }) => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable1, setSelectedTable1] = useState<string>('');
  const [selectedTable2, setSelectedTable2] = useState<string>('');
  const [joinColumn, setJoinColumn] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);

  // Mock data for now
  const mockTables = ['Calibrations', 'Instruments'];
  const mockColumns = {
    Calibrations: ['Job_no', 'Inst_ID', 'Cal_date'],
    Instruments: ['Inst_ID', 'Description', 'Manufacturer'],
  };

  return (
    <div>
      <h2>Step 4: Configure Data Sync</h2>
      <p>Select tables and define the join query to sync data from your external source.</p>
      
      <div className="query-builder">
        <h3>Select Tables to Join</h3>
        <div className="table-selection">
          <select value={selectedTable1} onChange={(e) => setSelectedTable1(e.target.value)}>
            <option value="">Select Table 1</option>
            {mockTables.map(table => <option key={table} value={table}>{table}</option>)}
          </select>
          <select value={selectedTable2} onChange={(e) => setSelectedTable2(e.target.value)}>
            <option value="">Select Table 2</option>
            {mockTables.map(table => <option key={table} value={table}>{table}</option>)}
          </select>
        </div>

        <h3>Define Join Condition</h3>
        <div className="join-condition">
          <span>ON</span>
          <input type="text" placeholder="Table1.Column" value={`${selectedTable1}.Inst_ID`} readOnly />
          <span>=</span>
          <input type="text" placeholder="Table2.Column" value={`${selectedTable2}.Inst_ID`} readOnly />
        </div>

        <h3>Select Columns to Sync</h3>
        <div className="column-selection">
          {selectedTable1 && mockColumns[selectedTable1 as keyof typeof mockColumns].map(col => (
            <div key={col}>
              <input type="checkbox" id={col} name={col} checked />
              <label htmlFor={col}>{`${selectedTable1}.${col}`}</label>
            </div>
          ))}
          {selectedTable2 && mockColumns[selectedTable2 as keyof typeof mockColumns].map(col => (
            <div key={col}>
              <input type="checkbox" id={col} name={col} checked />
              <label htmlFor={col}>{`${selectedTable2}.${col}`}</label>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onBack}>Back</button>
      <button onClick={onSubmit} disabled={loading}>
        {loading ? 'Completing...' : 'Complete Setup'}
      </button>
    </div>
  );
};

export default DataSync;
