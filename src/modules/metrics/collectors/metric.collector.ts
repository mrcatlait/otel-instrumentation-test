import { Injectable } from '@nestjs/common'

import { AbstractTelemetryCollector } from '../../shared/collectors'
import { Metric } from '../models'

@Injectable()
export class MetricCollector extends AbstractTelemetryCollector<Metric> {}
