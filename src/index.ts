import { startListening } from './listener';
import { startApi } from './api';

console.log('🚀 Starting Pet Shop Indexer...');

// Start blockchain event listener
startListening()
  .then(() => {
    console.log('Event listener started successfully');
  })
  .catch((error) => {
    console.error('Failed to start event listener:', error);
    process.exit(1);
  });

// Start REST API server
startApi();
