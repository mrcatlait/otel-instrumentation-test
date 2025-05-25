import { Injectable } from '@nestjs/common'

import { AbstractTelemetryCollector } from './abstract-telemetry.collector'
import { Span } from '../models/span.model'

@Injectable()
export class SpanCollector extends AbstractTelemetryCollector<Span> {}
