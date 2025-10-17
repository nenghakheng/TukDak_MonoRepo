import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
  param,
} from '@loopback/rest';
import {ValidationError, NotFoundError} from '../errors/custom-errors';
import { BaseController } from './base/base-controller';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController extends BaseController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {
    super();
  }

  @get('/ping')
  @response(200, PING_RESPONSE)
  ping(): object {
    return this.success({
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    });
  }

  @get('/ping/error/{type}')
  @response(200, {
    description: 'Test error handling',
  })
  testError(@param.path.string('type') errorType: string): object {
    switch (errorType) {
      case 'validation':
        throw new ValidationError('Test validation error', [
          {field: 'email', message: 'Invalid email format', value: 'invalid-email'}
        ]);
      case 'notfound':
        throw new NotFoundError('Guest', 123);
      case 'server':
        throw new Error('Test server error');
      default:
        return this.success({message: 'Error test completed'});
    }
  }
}