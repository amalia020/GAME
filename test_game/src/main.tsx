import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InkWalk } from './InkWalk';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InkWalk />
  </StrictMode>,
);
