import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { LOGGER_CONFIG, LoggerConfig } from '../config/logger.config';
import { LoggerService } from '../services/logger.service';

export const provideLogger = (config: LoggerConfig): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: LOGGER_CONFIG,
      useValue: config,
    },
    LoggerService,
  ]);
};
