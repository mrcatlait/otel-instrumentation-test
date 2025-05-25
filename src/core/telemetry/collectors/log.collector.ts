import { Injectable } from '@nestjs/common'
import { LogRecord } from '@opentelemetry/sdk-logs'

import { AbstractTelemetryCollector } from './abstract-telemetry.collector'

@Injectable()
export class LogCollector extends AbstractTelemetryCollector<LogRecord> {}
