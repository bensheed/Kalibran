import React from 'react';
import { useDrag } from 'react-dnd';
import { Card as CardType } from '../../models/Card';

interface CardProps {
    card: CardType;
}

const Card: React.FC<CardProps> = ({ card }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'card',
        item: { job_no: card.job_no, inst_id: card.inst_id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            style={{
                border: '1px solid gray',
                padding: '5px',
                margin: '5px',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
            }}
        >
            <p>Job No: {card.job_no}</p>
            <p>Inst ID: {card.inst_id}</p>
            {/* Render other card data as needed */}
        </div>
    );
};

export default Card;
