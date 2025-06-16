import { Injectable } from '@nestjs/common'

import { AbstractTelemetryCollector } from '../../shared/collectors'
import { Span } from '../models/span.model'

@Injectable()
export class SpanCollector extends AbstractTelemetryCollector<Span> {}
