import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './CreateBoard.css';

const CreateBoard: React.FC = () => {
    const [boardName, setBoardName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!boardName.trim()) {
            setError('Board name cannot be empty.');
            return;
        }
        try {
            const response = await api.post('/boards', { name: boardName });
            if (response.data && response.data.id) {
                navigate(`/board/${response.data.id}`);
            } else {
                setError('Failed to create board. Please try again.');
            }
        } catch (err) {
            setError('An error occurred while creating the board.');
            console.error(err);
        }
    };

    return (
        <div className="create-board-container">
            <form className="create-board-form" onSubmit={handleCreateBoard}>
                <h2>Create Your First Kanban Board</h2>
                <p>Welcome! It looks like you don't have any boards yet. Let's create one.</p>
                <input
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    placeholder="Enter board name"
                    className="create-board-input"
                />
                <button type="submit" className="create-board-button">Create Board</button>
                {error && <p className="create-board-error">{error}</p>}
            </form>
        </div>
    );
};

export default CreateBoard;
