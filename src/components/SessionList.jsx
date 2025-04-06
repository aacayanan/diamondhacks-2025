import React from 'react';

import Link from 'next/link';

function SessionList( { sessions } ) {
    return (
        <div className="flex h-[651px] overflow-y-auto rounded p-4 w-[300px]">
            <ul className="space-y-2">
                {sessions.length === 0 ? (
                    <li className="text-gray-500">No sessions completed.</li>
                ) : (
                    sessions.map((sessionId, index) => (
                        <li key={index}>
                            <Link href={`/Report/${sessionId}`}>
                                <div
                                    className="w-full p-3 bg-zinc-100 rounded cursor-pointer shadow-sm text-black">
                                    {sessionId}
                                </div>
                            </Link>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default SessionList;