import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import { ErrorHandlingSequence } from './sequence/error-handling-sequence';
import { DatabaseService } from './database/database.service';

export {ApplicationConfig};

export class TukdakApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up lifecycle hooks instead of overriding methods
    this.onStart(async () => {
      console.log('🔄 Initializing database...');
      const dbService = DatabaseService.getInstance();
      await dbService.initialize();
      console.log('✅ Database initialized successfully');
    });

    this.onStop(async () => {
      const dbService = DatabaseService.getInstance();
      await dbService.close();
      console.log('✅ Database connection closed');
    });

    // Set up the custom sequence
    this.sequence(ErrorHandlingSequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}