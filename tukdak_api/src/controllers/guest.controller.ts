import {
  post,
  get,
  patch,
  del,
  param,
  requestBody,
  response,
  getModelSchemaRef,
} from '@loopback/rest';
import {BaseController} from './base/base-controller';
import {GuestService} from '../services/guest-service';
import { 
  CreateGuestRequest, 
  GuestFilters, 
  SearchGuestsRequest, 
  SearchType, 
  UpdateGuestRequest,
  Guest,
  GuestStatistics
} from '../types/guest.types';

// Helper function to convert TypeScript types to JSON Schema
const createSchemaFromType = (example: any, required: string[] = []) => ({
  type: 'object' as const,
  properties: Object.keys(example).reduce((props, key) => {
    const value = example[key];
    let type: any;
    
    if (typeof value === 'string') type = { type: 'string' };
    else if (typeof value === 'number') type = { type: 'number' };
    else if (typeof value === 'boolean') type = { type: 'boolean' };
    else if (Array.isArray(value)) type = { type: 'array', items: { type: 'object' } };
    else if (value && typeof value === 'object') type = { type: 'object' };
    else type = { type: 'string' }; // fallback
    
    return { ...props, [key]: type };
  }, {}),
  required,
  additionalProperties: false
});

// Create schemas from your types
const GUEST_RESPONSE_EXAMPLE: Guest = {
  guest_id: 'G001',
  english_name: 'John Doe',
  khmer_name: 'ចន ដូ',
  amount_khr: 100000,
  amount_usd: 25,
  payment_method: 'QR_Code',
  guest_of: 'Bride',
  is_duplicate: false,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

export class GuestController extends BaseController {
  private guestService: GuestService;

  constructor() {
    super();
    this.guestService = new GuestService();
  }

  /**
   * Search for guests by query and search type
   */
  @post('/guests/search')
  @response(200, {
    description: 'Search guests successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                guests: {
                  type: 'array',
                  items: createSchemaFromType(GUEST_RESPONSE_EXAMPLE)
                },
                total_count: { type: 'number' },
                search_time_ms: { type: 'number' },
                query_used: { type: 'string' },
                search_type: { type: 'string', enum: ['guest_id', 'english_name', 'khmer_name'] }
              }
            }
          }
        }
      }
    }
  })
  async searchGuests(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['query', 'searchType'],
            properties: {
              query: { type: 'string', minLength: 1, maxLength: 100 },
              searchType: { 
                type: 'string', 
                enum: ['guest_id', 'english_name', 'khmer_name'] 
              },
              limit: { type: 'number', minimum: 1, maximum: 100 },
              offset: { type: 'number', minimum: 0 },
              includeDuplicates: { type: 'boolean' }
            }
          }
        }
      }
    })
    searchRequest: SearchGuestsRequest
  ) {
    try {
      console.log('🔍 Search request received:', searchRequest);
      const result = await this.guestService.searchGuests(searchRequest);
      return this.success(result);
    } catch (error) {
      console.error('❌ Search error:', error);
      throw error;
    }
  }

  @post('/guests')
  @response(201, {
    description: 'Create a new guest',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: createSchemaFromType(GUEST_RESPONSE_EXAMPLE, ['guest_id', 'english_name', 'khmer_name', 'guest_of'])
          },
          required: ['success', 'data']
        }
      }
    }
  })
  async createGuest(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['guest_id', 'name', 'guest_of'],
            properties: {
              guest_id: { type: 'string', minLength: 1 },
              name: { type: 'string', minLength: 1 },
              english_name: { type: 'string' },
              khmer_name: { type: 'string' },
              amount_khr: { type: 'number', minimum: 0 },
              amount_usd: { type: 'number', minimum: 0 },
              payment_method: { type: 'string', enum: ['QR_Code', 'Cash'], nullable: true },
              guest_of: { type: 'string', enum: ['Bride', 'Groom', 'Bride_Parents', 'Groom_Parents'] }
            },
            additionalProperties: false
          }
        }
      }
    })
    guestData: CreateGuestRequest
  ) {
    const guest = await this.guestService.createGuest(guestData);
    return this.success(guest);
  }

  @get('/guests/{guestId}')
  @response(200, {
    description: 'Get guest by ID',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: createSchemaFromType(GUEST_RESPONSE_EXAMPLE)
          },
          required: ['success', 'data']
        }
      }
    }
  })
  async getGuestById(@param.path.string('guestId') guestId: string) {
    const guest = await this.guestService.getGuestById(guestId);
    return this.success(guest);
  }

  @get('/guests')
  @response(200, {
    description: 'Get all guests with optional filters',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: createSchemaFromType(GUEST_RESPONSE_EXAMPLE)
            }
          },
          required: ['success', 'data']
        }
      }
    }
  })
  async getAllGuests(
    @param.query.string('guest_of') guest_of?: string,
    @param.query.string('payment_method') payment_method?: string,
    @param.query.boolean('has_payment') has_payment?: boolean,
    @param.query.boolean('is_duplicate') is_duplicate?: boolean
  ) {
    const filters: GuestFilters = {};
    
    if (guest_of) filters.guest_of = guest_of as any;
    if (payment_method) filters.payment_method = payment_method as any;
    if (has_payment !== undefined) filters.has_payment = has_payment;
    if (is_duplicate !== undefined) filters.is_duplicate = is_duplicate;

    const guests = await this.guestService.getAllGuests(filters);
    return this.success(guests);
  }

  @patch('/guests/{guestId}')
  @response(200, {
    description: 'Update guest information',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: createSchemaFromType(GUEST_RESPONSE_EXAMPLE)
          },
          required: ['success', 'data']
        }
      }
    }
  })
  async updateGuest(
    @param.path.string('guestId') guestId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              english_name: { type: 'string' },
              khmer_name: { type: 'string' },
              amount_khr: { type: 'number', minimum: 0 },
              amount_usd: { type: 'number', minimum: 0 },
              payment_method: { 
                oneOf: [
                  { type: 'string', enum: ['QR_Code', 'Cash'] },
                  { type: 'null' }
                ]
              },
              guest_of: { type: 'string', enum: ['Bride', 'Groom', 'Bride_Parents', 'Groom_Parents'] },
              is_duplicate: { type: 'boolean' }
            },
            additionalProperties: false
          }
        }
      }
    })
    updates: UpdateGuestRequest
  ) {
    const guest = await this.guestService.updateGuest(guestId, updates);
    return this.success(guest);
  }

  @del('/guests/{guestId}')
  @response(200, {
    description: 'Delete guest (soft delete by default)',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                deleted: { type: 'boolean' }
              },
              required: ['deleted']
            }
          },
          required: ['success', 'data']
        }
      }
    }
  })
  async deleteGuest(
    @param.path.string('guestId') guestId: string,
    @param.query.boolean('hard') hardDelete?: boolean
  ) {
    const result = await this.guestService.deleteGuest(guestId, !hardDelete);
    return this.success({ deleted: result });
  }

  @get('/guests-stats')
  @response(200, {
    description: 'Get guest statistics',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                total_guests: { type: 'number' },
                total_khr: { type: 'number' },
                total_usd: { type: 'number' },
                paid_guests: { type: 'number' },
                pending_guests: { type: 'number' },
                duplicates: { type: 'number' },
                payment_methods: {
                  type: 'object',
                  properties: {
                    qr_code: { type: 'number' },
                    cash: { type: 'number' },
                    pending: { type: 'number' }
                  }
                },
                guest_distribution: {
                  type: 'object',
                  properties: {
                    bride: { type: 'number' },
                    groom: { type: 'number' },
                    bride_parents: { type: 'number' },
                    groom_parents: { type: 'number' }
                  }
                }
              }
            }
          },
          required: ['success', 'data']
        }
      }
    }
  })
  async getStatistics() {
    const stats = await this.guestService.getStatistics();
    return this.success(stats);
  }
}