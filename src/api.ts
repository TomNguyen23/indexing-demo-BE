import express from 'express';
import cors from 'cors';
import { 
  getShopStats, 
} from './db';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// // Request logging middleware
// app.use((req, res, next) => {
//   console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
//   next();
// });

// // Error handling middleware
// const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Get shop statistics - pet sales count by pet name
 * GET /shop/:address/stats
 */
app.get('/shop/:address/stats', (req, res) => {
  const shopAddress = req.params.address;
  
  if (!shopAddress) {
    return res.status(400).json({ error: 'Shop address is required' });
  }
  
  const stats = getShopStats(shopAddress);
  return res.json(stats);
});

/**
 * Get API documentation/endpoints
 * GET /
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Pet Shop Indexer API',
    version: '1.0.0',
    description: 'REST API for Pet Shop blockchain events',
    endpoints: {
      'GET /health': 'Health check',
      'GET /shop/:address/stats': 'Get shop statistics (pet sales by type)'
    },
    examples: {
      shop_stats: '/shop/ABC123DEF456/stats',
      recent_events: '/events/recent?limit=10',
      search_pets: '/search/pets?name=shiba&limit=50'
    }
  });
});


/**
 * Global error handler
 */
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

/**
 * Start the API server
 */
export const startApi = (): void => {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
};

export { app };