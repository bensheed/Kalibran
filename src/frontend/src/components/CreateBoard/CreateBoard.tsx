import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createBoard } from '../../services/api';
import { useAuthStore2 as useAuthStore } from '../../store/authStore2';
import { useBoardStore } from '../../store/boardStore';
import './CreateBoard.css';

const CreateBoard: React.FC = () => {
    console.log('CreateBoard: Component rendering');
    
    const [boardName, setBoardName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, token, logout } = useAuthStore();
    const { boards, fetchBoards } = useBoardStore();
    
    console.log('CreateBoard component mounted');
    console.log('CreateBoard: Auth state in CreateBoard:', isAuthenticated ? 'Authenticated' : 'Not Authenticated');
    console.log('CreateBoard: Token in CreateBoard:', token ? token : 'No token');
    console.log('CreateBoard: boards:', boards);
    
    // Load existing boards
    useEffect(() => {
        console.log('CreateBoard: useEffect - calling fetchBoards');
        fetchBoards().catch(err => {
            console.error('CreateBoard: Error fetching boards:', err);
        });
    }, [fetchBoards]);

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!boardName.trim()) {
            setError('Board name is required.');
            setLoading(false);
            return;
        }

        console.log('CreateBoard: Attempting to create board with name:', boardName);
        console.log('CreateBoard: Auth state:', isAuthenticated ? 'Authenticated' : 'Not Authenticated');
        console.log('CreateBoard: Token for board creation:', token);
        
        // Additional debugging for token
        console.log('CreateBoard: Token for board creation (raw):', token);
        
        // Check if we have authentication
        if (!token) {
            console.log('CreateBoard: No authentication token found in store or cookies!');
            setError('Authentication error: No token found. Please log in again.');
            setLoading(false);
            return;
        }
        
        try {
            const data = await createBoard(boardName);
            
            setSuccess('Board created successfully! Redirecting...');
            
            // Refresh boards list
            await fetchBoards();
            
            // Navigate to the new board after a brief delay
            setTimeout(() => {
                navigate(`/board/${data.id}`);
            }, 1000);
            
        } catch (err: any) {
            setError(err.message || 'Failed to create board. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBoardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBoardName(e.target.value);
        setError(''); // Clear error when user starts typing
    };

    return (
        <div className="create-board-container">
            <div className="create-board-content">
                {/* Header */}
                <div className="create-board-header">
                    <div className="create-board-logo">🔬</div>
                    <h1 className="create-board-title">Kalibran</h1>
                    <p className="create-board-subtitle">Calibration Lab Management System</p>
                </div>

                {/* Navigation */}
                <div className="create-board-nav">
                    <Link to="/create-board" className="nav-button active">
                        <span className="nav-icon">➕</span>
                        Create Board
                    </Link>
                    {isAuthenticated && (
                        <Link to="/settings" className="nav-button">
                            <span className="nav-icon">⚙️</span>
                            Settings
                        </Link>
                    )}
                    {isAuthenticated ? (
                        <button 
                            onClick={() => {
                                console.log('Logout button clicked');
                                logout();
                                window.location.reload(); // Force page reload to clear state
                            }} 
                            className="nav-button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <span className="nav-icon">🚪</span>
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="nav-button">
                            <span className="nav-icon">👤</span>
                            Admin Login
                        </Link>
                    )}
                </div>

                {/* Main Content */}
                <div className="create-board-card">
                    <div className="card-header">
                        <h2 className="card-title">Create New Board</h2>
                        <p className="card-description">
                            Set up a new Kanban board to organize your calibration workflow
                        </p>
                    </div>

                    <div className="card-content">
                        <form onSubmit={handleCreateBoard} className="create-board-form">
                            <div className="form-group">
                                <label htmlFor="boardName" className="form-label">
                                    Board Name *
                                </label>
                                <input
                                    id="boardName"
                                    type="text"
                                    value={boardName}
                                    onChange={handleBoardNameChange}
                                    placeholder="e.g., Main Calibration Lab, Testing Department"
                                    className="form-input"
                                    disabled={loading}
                                    maxLength={100}
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description" className="form-label">
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of this board's purpose..."
                                    className="form-input form-textarea"
                                    disabled={loading}
                                    maxLength={500}
                                />
                            </div>

                            {error && (
                                <div className="message message-error">
                                    <span className="message-icon">⚠️</span>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="message message-success">
                                    <span className="message-icon">✅</span>
                                    {success}
                                </div>
                            )}

                            <div className="form-actions">
                                <Link to="/" className="btn-cancel">
                                    Cancel
                                </Link>
                                <button 
                                    type="submit" 
                                    className="btn-create"
                                    disabled={loading || !boardName.trim()}
                                >
                                    {loading ? (
                                        <>
                                            <div className="loading-spinner"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Board'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Existing Boards */}
                {boards && boards.length > 0 && (
                    <div className="create-board-card">
                        <div className="card-header">
                            <h2 className="card-title">Existing Boards</h2>
                            <p className="card-description">
                                Click on any board to access it
                            </p>
                        </div>

                        <div className="card-content">
                            <div className="boards-list">
                                {boards && boards.length > 0 ? boards.map((board) => (
                                    <Link
                                        key={board.id}
                                        to={`/board/${board.id}`}
                                        className="board-item"
                                    >
                                        <div className="board-item-header">
                                            <h3 className="board-item-title">{board.name}</h3>
                                            <span className="board-item-id">#{board.id}</span>
                                        </div>
                                        <div className="board-item-meta">
                                            <div className="board-item-stats">
                                                <div className="board-item-stat">
                                                    <span className="stat-icon">📋</span>
                                                    <span>0 columns</span>
                                                </div>
                                                <div className="board-item-stat">
                                                    <span className="stat-icon">📝</span>
                                                    <span>0 cards</span>
                                                </div>
                                            </div>
                                            <span>Click to open →</span>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📋</div>
                                        <div className="empty-state-title">No boards yet</div>
                                        <div className="empty-state-description">
                                            Create your first board to get started
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State for No Boards */}
                {boards && boards.length === 0 && (
                    <div className="create-board-card">
                        <div className="card-content">
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <h3 className="empty-state-title">No Boards Yet</h3>
                                <p className="empty-state-text">
                                    Create your first board to start organizing your calibration workflow.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateBoard;
