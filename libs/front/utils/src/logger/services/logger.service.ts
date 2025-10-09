import { inject, Injectable } from '@angular/core';
import { LOGGER_CONFIG } from '../config/logger.config';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly isProd: boolean;
  private readonly config = inject(LOGGER_CONFIG);

  constructor() {
    this.isProd = this.config.production;
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isProd) {
      console.log(message, ...optionalParams);
    }
  }

  info(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isProd) {
      console.info(message, ...optionalParams);
    }
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isProd) {
      console.warn(message, ...optionalParams);
    }
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isProd) {
      console.error(message, ...optionalParams);
    }
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isProd) {
      console.debug(message, ...optionalParams);
    }
  }
}
