import React, { useEffect, useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useBoardStore } from '../../store/boardStore';
import Column from '../Column/Column';
import { Link, useParams } from 'react-router-dom';
import './Board.css';

interface BoardTab {
    id: number;
    name: string;
    isActive: boolean;
}

const Board: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const {
        selectedBoard,
        columns,
        cards,
        loading,
        error,
        fetchBoardById,
        boards,
        fetchBoards,
    } = useBoardStore();
    
    const [scale, setScale] = useState(1);
    const [boardTabs, setBoardTabs] = useState<BoardTab[]>([]);

    // Load boards for tabs
    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    // Update board tabs when boards change
    useEffect(() => {
        if (boards && boards.length > 0) {
            const currentBoardId = boardId ? parseInt(boardId, 10) : null;
            const tabs = boards.map(board => ({
                id: board.id,
                name: board.name,
                isActive: board.id === currentBoardId
            }));
            setBoardTabs(tabs);
        }
    }, [boards, boardId]);

    // Fetch board data
    useEffect(() => {
        if (boardId) {
            const id = parseInt(boardId, 10);
            fetchBoardById(id);
            localStorage.setItem('lastViewedBoardId', id.toString());
        }
    }, [boardId, fetchBoardById]);

    // Scale controls
    const handleScaleUp = useCallback(() => {
        setScale(prev => Math.min(prev + 0.1, 2.0));
    }, []);

    const handleScaleDown = useCallback(() => {
        setScale(prev => Math.max(prev - 0.1, 0.5));
    }, []);

    const handleResetScale = useCallback(() => {
        setScale(1);
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="board-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    Loading board...
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="board-container">
                <div className="board-header">
                    <div className="board-title-section">
                        <h1 className="board-title">Error Loading Board</h1>
                    </div>
                    <div className="board-controls">
                        <Link to="/settings" className="btn-primary">
                            Go to Settings
                        </Link>
                    </div>
                </div>
                <div className="board-content">
                    <div className="empty-board">
                        <div className="empty-board-icon">⚠️</div>
                        <div className="empty-board-title">Unable to Load Board</div>
                        <div className="empty-board-text">{error}</div>
                        <Link to="/settings" className="btn-primary">
                            Check Settings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // No board selected
    if (!selectedBoard) {
        return (
            <div className="board-container">
                <div className="board-header">
                    <div className="board-title-section">
                        <h1 className="board-title">No Board Selected</h1>
                    </div>
                    <div className="board-controls">
                        <Link to="/create-board" className="btn-primary">
                            Create Board
                        </Link>
                    </div>
                </div>
                <div className="board-content">
                    <div className="empty-board">
                        <div className="empty-board-icon">📋</div>
                        <div className="empty-board-title">No Board Found</div>
                        <div className="empty-board-text">
                            The requested board could not be found or you don't have access to it.
                        </div>
                        <Link to="/create-board" className="btn-primary">
                            Create New Board
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="board-container">
                {/* Board Header */}
                <div className="board-header">
                    <div className="board-title-section">
                        <div>
                            <h1 className="board-title">{selectedBoard.name}</h1>
                            <p className="board-subtitle">
                                {columns?.length || 0} columns • {cards?.length || 0} cards
                            </p>
                        </div>
                        
                        {/* Board Tabs */}
                        {boardTabs.length > 1 && (
                            <div className="board-tabs">
                                {boardTabs.map(tab => (
                                    <Link
                                        key={tab.id}
                                        to={`/board/${tab.id}`}
                                        className={`board-tab ${tab.isActive ? 'active' : ''}`}
                                    >
                                        {tab.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="board-controls">
                        {/* Scale Controls */}
                        <div className="scale-controls">
                            <button 
                                className="scale-button" 
                                onClick={handleScaleDown}
                                title="Zoom Out"
                                disabled={scale <= 0.5}
                            >
                                −
                            </button>
                            <div 
                                className="scale-display"
                                onClick={handleResetScale}
                                title="Click to reset zoom"
                                style={{ cursor: 'pointer' }}
                            >
                                {Math.round(scale * 100)}%
                            </div>
                            <button 
                                className="scale-button" 
                                onClick={handleScaleUp}
                                title="Zoom In"
                                disabled={scale >= 2.0}
                            >
                                +
                            </button>
                        </div>

                        <Link to="/settings" className="btn-secondary">
                            Settings
                        </Link>
                    </div>
                </div>

                {/* Board Content */}
                <div className="board-content">
                    <div 
                        className="board-viewport"
                        style={{ transform: `scale(${scale})` }}
                    >
                        {columns && columns.length > 0 ? (
                            <div className="columns-container">
                                {columns.map((column) => (
                                    <div key={column.id} className="kanban-column">
                                        <div className="column-header">
                                            <h3 className="column-title">{column.name}</h3>
                                            <div className="column-count">
                                                {cards?.length || 0} cards
                                            </div>
                                        </div>
                                        <div className="column-content">
                                            {!cards || cards.length === 0 ? (
                                                <div className="empty-column">
                                                    <div className="empty-column-icon">📝</div>
                                                    <div className="empty-column-text">No cards in this column</div>
                                                </div>
                                            ) : (
                                                cards.map(card => (
                                                    <div key={`${card.job_no}-${card.inst_id}`} className="kanban-card">
                                                        <div className="card-header">
                                                            <div className="card-id">#{card.job_no}</div>
                                                            <div className="card-priority low">Normal</div>
                                                        </div>
                                                        <div className="card-title">
                                                            {card.data?.instrument_name || `Job ${card.job_no}`}
                                                        </div>
                                                        <div className="card-details">
                                                            <div className="card-detail">
                                                                <span className="card-detail-label">Instrument:</span>
                                                                <span className="card-detail-value">{card.inst_id}</span>
                                                            </div>
                                                            <div className="card-detail">
                                                                <span className="card-detail-label">Status:</span>
                                                                <span className="card-detail-value">In Progress</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-board">
                                <div className="empty-board-icon">📋</div>
                                <div className="empty-board-title">No Columns Found</div>
                                <div className="empty-board-text">
                                    This board doesn't have any columns yet. Add columns to start organizing your workflow.
                                </div>
                                <Link to="/settings" className="btn-primary">
                                    Configure Board
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default Board;
