import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useBoardStore } from '../../store/boardStore';
import Column from '../Column/Column';
import { Link, useParams } from 'react-router-dom';

const Board: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const {
        selectedBoard,
        columns,
        cards,
        loading,
        error,
        fetchBoardById,
    } = useBoardStore();
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (boardId) {
            const id = parseInt(boardId, 10);
            fetchBoardById(id);
            localStorage.setItem('lastViewedBoardId', id.toString());
        }
    }, [boardId, fetchBoardById]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!selectedBoard) {
        return <div>No board selected</div>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <h1>{selectedBoard.name}</h1>
                <Link to="/settings">Settings</Link>
                <div>
                    <button onClick={() => setScale(scale + 0.1)}>+</button>
                    <button onClick={() => setScale(scale - 0.1)}>-</button>
                </div>
                <div style={{ display: 'flex', transform: `scale(${scale})` }}>
                    {columns && columns.length > 0 ? (
                        columns.map((column) => (
                            <Column
                                key={column.id}
                                column={column}
                                cards={cards?.filter((card) => {
                                    return true;
                                }) || []}
                            />
                        ))
                    ) : (
                        <div>No columns found for this board</div>
                    )}
                </div>
            </div>
        </DndProvider>
    );
};

export default Board;
