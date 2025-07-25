console.log('[API] Starting api.ts file...');

export function loginUser(pin: string) {
    console.log('[API] loginUser called with pin:', pin);
    return Promise.resolve({ success: true, token: 'test-token' });
}

console.log('[API] loginUser function defined and exported');
console.log('[API] typeof loginUser:', typeof loginUser);
