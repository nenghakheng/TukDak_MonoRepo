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
import { CreateGuestRequest, GuestFilters, UpdateGuestRequest } from '../types/guest.types';

const GUEST_SCHEMA = {
  type: 'object' as const,
  required: ['guest_id', 'name', 'guest_of'],
  properties: {
    guest_id: {type: 'string' as const, minLength: 1},
    name: {type: 'string' as const, minLength: 1},
    amount_khr: {type: 'number' as const, minimum: 0},
    amount_usd: {type: 'number' as const, minimum: 0},
    payment_method: {type: 'string' as const, enum: ['QR_Code', 'Cash'], nullable: true},
    guest_of: {type: 'string' as const, enum: ['Bride', 'Groom', 'Bride_Parents', 'Groom_Parents']},
    is_duplicate: {type: 'boolean' as const},
    created_at: {type: 'string' as const, format: 'date-time'},
    updated_at: {type: 'string' as const, format: 'date-time'},
  },
  additionalProperties: false
};

const CREATE_GUEST_SCHEMA = {
  type: 'object' as const,
  required: ['guest_id', 'name', 'guest_of'],
  properties: {
    guest_id: {type: 'string' as const, minLength: 1},
    name: {type: 'string' as const, minLength: 1},
    amount_khr: {type: 'number' as const, minimum: 0},
    amount_usd: {type: 'number' as const, minimum: 0},
    payment_method: {type: 'string' as const, enum: ['QR_Code', 'Cash']},
    guest_of: {type: 'string' as const, enum: ['Bride', 'Groom', 'Bride_Parents', 'Groom_Parents']},
    is_duplicate: {type: 'boolean' as const},
  },
  additionalProperties: false
};

const UPDATE_GUEST_SCHEMA = {
  type: 'object' as const,
  properties: {
    name: {type: 'string' as const, minLength: 1},
    amount_khr: {type: 'number' as const, minimum: 0},
    amount_usd: {type: 'number' as const, minimum: 0},
    payment_method: {
      oneOf: [
        {type: 'string' as const, enum: ['QR_Code', 'Cash']},
        {type: 'null' as const}
      ]
    },
    is_duplicate: {type: 'boolean' as const},
  },
  additionalProperties: false
};

const GUEST_STATS_SCHEMA = {
  type: 'object' as const,
  properties: {
    total_guests: {type: 'number' as const},
    total_khr: {type: 'number' as const},
    total_usd: {type: 'number' as const},
    paid_guests: {type: 'number' as const},
    pending_guests: {type: 'number' as const},
    duplicates: {type: 'number' as const},
    payment_methods: {
      type: 'object' as const,
      properties: {
        qr_code: {type: 'number' as const},
        cash: {type: 'number' as const},
        pending: {type: 'number' as const},
      }
    },
    guest_distribution: {
      type: 'object' as const,
      properties: {
        bride: {type: 'number' as const},
        groom: {type: 'number' as const},
        bride_parents: {type: 'number' as const},
        groom_parents: {type: 'number' as const},
      }
    },
  },
  additionalProperties: false
};

const SUCCESS_RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    success: {type: 'boolean' as const},
    data: {type: 'object' as const},
  },
  required: ['success'],
  additionalProperties: false
};

export class GuestController extends BaseController {
  private guestService: GuestService;

  constructor() {
    super();
    this.guestService = new GuestService();
  }

  @post('/guests')
  @response(201, {
    description: 'Create a new guest',
    content: {
      'application/json': {
        schema: {
          type: 'object' as const,
          properties: {
            success: {type: 'boolean' as const},
            data: GUEST_SCHEMA,
          },
          required: ['success', 'data'],
          additionalProperties: false
        },
      },
    },
  })
  async createGuest(
    @requestBody({
      content: {
        'application/json': {
          schema: CREATE_GUEST_SCHEMA,
        },
      },
    })
    guestData: CreateGuestRequest,
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
          type: 'object' as const,
          properties: {
            success: {type: 'boolean' as const},
            data: GUEST_SCHEMA,
          },
          required: ['success', 'data'],
          additionalProperties: false
        },
      },
    },
  })
  async getGuestById(
    @param.path.string('guestId') guestId: string,
  ) {
    const guest = await this.guestService.getGuestById(guestId);
    return this.success(guest);
  }

  @get('/guests')
  @response(200, {
    description: 'Get all guests with optional filters',
    content: {
      'application/json': {
        schema: {
          type: 'object' as const,
          properties: {
            success: {type: 'boolean' as const},
            data: {
              type: 'array' as const,
              items: GUEST_SCHEMA,
            },
          },
          required: ['success', 'data'],
          additionalProperties: false
        },
      },
    },
  })
  async getAllGuests(
    @param.query.string('guest_of') guest_of?: string,
    @param.query.string('payment_method') payment_method?: string,
    @param.query.boolean('has_payment') has_payment?: boolean,
    @param.query.boolean('is_duplicate') is_duplicate?: boolean,
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
          type: 'object' as const,
          properties: {
            success: {type: 'boolean' as const},
            data: GUEST_SCHEMA,
          },
          required: ['success', 'data'],
          additionalProperties: false
        },
      },
    },
  })
  async updateGuest(
    @param.path.string('guestId') guestId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: UPDATE_GUEST_SCHEMA,
        },
      },
    })
    updates: UpdateGuestRequest,
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
          type: 'object' as const,
          properties: {
            success: {type: 'boolean' as const},
            data: {
              type: 'object' as const,
              properties: {
                deleted: {type: 'boolean' as const}
              },
              required: ['deleted'],
              additionalProperties: false
            },
          },
          required: ['success', 'data'],
          additionalProperties: false
        },
      },
    },
  })
  async deleteGuest(
    @param.path.string('guestId') guestId: string,
    @param.query.boolean('hard') hardDelete?: boolean,
  ) {
    const result = await this.guestService.deleteGuest(guestId, !hardDelete);
    return this.success({deleted: result});
  }

  @get('/guests-stats')
  @response(200, {
    description: 'Get guest statistics',
    content: {
      'application/json': {
        schema: {
          type: 'object' as const,
          properties: {
            success: {type: 'boolean' as const},
            data: GUEST_STATS_SCHEMA,
          },
          required: ['success', 'data'],
          additionalProperties: false
        },
      },
    },
  })
  async getStatistics() {
    const stats = await this.guestService.getStatistics();
    return this.success(stats);
  }
}