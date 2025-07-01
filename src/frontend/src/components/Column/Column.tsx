import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Column as ColumnType } from '../../models/Column';
import { Card as CardType } from '../../models/Card';
import Card from '../Card/Card';
import { useBoardStore } from '../../store/boardStore';

interface ColumnProps {
    column: ColumnType;
    cards: CardType[];
}

const Column: React.FC<ColumnProps> = ({ column, cards }) => {
    const moveCard = useBoardStore((state) => state.moveCard);
    const { settings, fetchSettings } = useBoardStore();
    const [sortedCards, setSortedCards] = useState(cards);
    const columnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const handleScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (columnRef.current) {
                    columnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, settings.inactivity_timeout || 60000); // Default to 60 seconds
        };

        const currentColumnRef = columnRef.current;
        currentColumnRef?.addEventListener('scroll', handleScroll);

        return () => {
            currentColumnRef?.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [settings.inactivity_timeout]);

    const [, drop] = useDrop(() => ({
        accept: 'card',
        drop: (item: { job_no: string, inst_id: number }) => {
            moveCard(item.job_no, column.id, item.inst_id);
        },
    }));

    const sortCards = () => {
        const newSortedCards = [...sortedCards].sort((a, b) => {
            return a.job_no.localeCompare(b.job_no);
        });
        setSortedCards(newSortedCards);
    };

    useEffect(() => {
        setSortedCards(cards);
    }, [cards]);

    return (
        <div ref={columnRef} style={{ border: '1px solid black', padding: '10px', margin: '10px', minHeight: '200px', height: '500px', overflowY: 'auto' }}>
            <h2>{column.name}</h2>
            <button onClick={sortCards}>Sort by Job No</button>
            <div ref={drop} style={{ minHeight: '200px' }}>
                {sortedCards.map((card) => (
                    <Card key={card.job_no} card={card} />
                ))}
            </div>
        </div>
    );
};

export default Column;
