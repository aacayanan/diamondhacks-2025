//Root directory is currently working as the home page
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [clicked, setClicked] = useState(false);

  return (
      <div>
        <h1>Login Page</h1>
        <Link href="Session">Start Session</Link>
      </div>
  );
}