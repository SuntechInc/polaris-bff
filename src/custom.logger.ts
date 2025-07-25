import { LoggerService } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class CustomLogger implements LoggerService {
  private static contextRules: Record<string, number> = {};

  private readonly LOG_LEVEL_MAP: Record<string, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
  };

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
  ) {
    if (Object.keys(CustomLogger.contextRules).length === 0) {
      this.initializeContextRules();
    }
  }

  log(message: string, context?: string) {
    if (this.shouldLog('info', context)) {
      this.logger.info({ context }, message);
    }
  }

  error(message: string, trace?: string, context?: string) {
    if (this.shouldLog('error', context)) {
      this.logger.error({ context, trace }, message);
    }
  }

  warn(message: string, context?: string) {
    if (this.shouldLog('warn', context)) {
      this.logger.warn({ context }, message);
    }
  }

  debug(message: string, context?: string) {
    if (this.shouldLog('debug', context)) {
      this.logger.debug({ context }, message);
    }
  }

  verbose(message: string, context?: string) {
    if (this.shouldLog('trace', context)) {
      this.logger.trace({ context }, message);
    }
  }

  private initializeContextRules() {
    const rules = process.env.LOG_RULES;
    if (!rules) {
      // Define nível baseado no ambiente
      const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
      CustomLogger.contextRules['*'] = this.LOG_LEVEL_MAP[defaultLevel];
      return;
    }

    const rulesEntries = rules.split('/');
    for (const rule of rulesEntries) {
      let contextPart = '*';
      let levelPart = 'info';
      const parts = rule.split(';');

      for (const part of parts) {
        if (part.startsWith('context=')) {
          contextPart = part.split('=')[1] || contextPart;
        }
        if (part.startsWith('level=')) {
          levelPart = part.split('=')[1] || levelPart;
        }
      }

      const context = contextPart.split(',');
      const numericLevel =
        this.LOG_LEVEL_MAP[levelPart.trim()] || this.LOG_LEVEL_MAP['info'];

      for (const ctx of context) {
        CustomLogger.contextRules[ctx.trim()] = numericLevel;
      }
    }
  }

  private shouldLog(methodLevel: string, context: string): boolean {
    return this.LOG_LEVEL_MAP[methodLevel] >= this.getLogLevel(context);
  }

  private getLogLevel(context?: string): number {
    context = context || '';
    const level =
      CustomLogger.contextRules[context] ??
      CustomLogger.contextRules['*'] ??
      this.LOG_LEVEL_MAP['info'];
    return level;
  }
}
