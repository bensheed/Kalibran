console.log('[API] Starting api.ts file...');

// Create a fetch-based API object that mimics axios interface
const api = {
    async get(url: string) {
        console.log('[API] GET request to:', url);
        const response = await fetch(`http://localhost:3001${url}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return { data: await response.json() };
    },
    
    async post(url: string, data?: any) {
        console.log('[API] POST request to:', url, 'with data:', data);
        const response = await fetch(`http://localhost:3001${url}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : undefined
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return { data: await response.json() };
    }
};

export async function loginUser(pin: string) {
    console.log('[API] loginUser called with pin:', pin);
    const response = await api.post('/api/login', { pin });
    return response.data; // Return data directly for individual functions
}

export const createBoard = async (name: string) => {
    const response = await api.post('/api/boards', { name });
    return response.data; // Return data directly for individual functions
};

console.log('[API] API functions defined and exported');
console.log('[API] typeof loginUser:', typeof loginUser);
console.log('[API] typeof api.get:', typeof api.get);

// Export the api object as default so other files can use api.get(), api.post(), etc.
export default api;
