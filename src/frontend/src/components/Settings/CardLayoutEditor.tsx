import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import api from '../../services/api';

const CardLayoutEditor: React.FC = () => {
    const { selectedBoard, fetchBoardById } = useBoardStore();
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    useEffect(() => {
        // This is a mock of the available fields.
        // In a real application, this would be fetched from the backend.
        setAvailableFields(['Job_no', 'Inst_ID', 'Customer', 'Model', 'Serial_No']);
        if (selectedBoard) {
            setSelectedFields(selectedBoard.card_layout_config);
        }
    }, [selectedBoard]);

    const handleSave = async () => {
        if (selectedBoard) {
            try {
                await api.put(`/boards/${selectedBoard.id}`, {
                    card_layout_config: selectedFields,
                });
                fetchBoardById(selectedBoard.id);
            } catch (error) {
                console.error('Failed to save card layout', error);
            }
        }
    };

    const handleCheckboxChange = (field: string) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter((f) => f !== field));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    if (!selectedBoard) {
        return <div>Select a board to edit its card layout.</div>;
    }

    return (
        <div>
            <h3>Card Layout Editor</h3>
            {availableFields.map((field) => (
                <div key={field}>
                    <input
                        type="checkbox"
                        checked={selectedFields.includes(field)}
                        onChange={() => handleCheckboxChange(field)}
                    />
                    {field}
                </div>
            ))}
            <button onClick={handleSave}>Save Layout</button>
        </div>
    );
};

export default CardLayoutEditor;
