import {get, response} from '@loopback/rest';
import {DatabaseService} from '../database/database.service';
import {BaseController} from './base/base-controller';

export class HealthController extends BaseController {
  
  @get('/health')
  @response(200, {
    description: 'Health check endpoint',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: {type: 'string'},
            timestamp: {type: 'string'},
            database: {type: 'object'},
          },
        },
      },
    },
  })
  async health() {
    const dbService = DatabaseService.getInstance();
    const dbHealth = await dbService.healthCheck();
    
    return this.success({
      status: dbHealth.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
    });
  }
}