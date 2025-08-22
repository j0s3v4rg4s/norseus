import { InjectionToken } from '@angular/core';

export interface LoggerConfig {
  production: boolean;
}

export const LOGGER_CONFIG = new InjectionToken<LoggerConfig>('LoggerConfig');
