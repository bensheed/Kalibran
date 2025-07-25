console.log('[API] Starting api.ts file...');

// Simple approach - just use fetch instead of axios to avoid import issues
console.log('[API] Using fetch API instead of axios');

// Simple loginUser function without axios for now
export async function loginUser(pin: string) {
    console.log('[API] loginUser called with pin:', pin);
    
    // Use fetch instead of axios for now
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ pin })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[API] Error in loginUser:', error);
        throw error;
    }
}

console.log('[API] loginUser function defined and exported');
console.log('[API] typeof loginUser:', typeof loginUser);

export const createBoard = async (name: string) => {
    const response = await fetch('http://localhost:3001/api/boards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// Export a simple object as default
export default {
    loginUser,
    createBoard
};
