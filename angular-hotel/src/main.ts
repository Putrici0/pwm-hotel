import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { defineCustomElements as defineJeepSqlite } from 'jeep-sqlite/loader';

defineJeepSqlite(window);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
