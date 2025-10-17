import {inject} from '@loopback/core';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {ErrorHandler} from '../errors/error-handler';

const SequenceActions = RestBindings.SequenceActions;

export class ErrorHandlingSequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);

      // Wrap successful responses in standard format
      if (result && typeof result === 'object' && !result.success) {
        const wrappedResult = {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };
        this.send(response, wrappedResult);
      } else {
        this.send(response, result);
      }
    } catch (error) {
      // Log the error
      ErrorHandler.logError(error, context.request);

      // Format the error response
      const formattedError = ErrorHandler.formatError(error, context.request);
      
      // Set proper status code
      const statusCode = formattedError.error.statusCode;
      context.response.status(statusCode);
      
      // Send formatted error
      this.send(context.response, formattedError);
    }
  }
}