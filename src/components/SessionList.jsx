'use client';

import React from 'react';

async function SessionList( { sessions } ) {
    return (
        <div className="h-96 overflow-y-auto border rounded p-4">
            <ul className="space-y-2">
                {sessions.length === 0 ? (
                    <li className="text-gray-500">No sessions completed.</li>
                ) : (
                    sessions.map((sessionId, index) => (
                        <li key={index} className="p-2 bg-blue-100 rounded shadow-sm">
                            {sessionId}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default SessionList;