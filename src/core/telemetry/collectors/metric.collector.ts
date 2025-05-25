// import { Metric } from '@opentelemetry/sdk-metrics'

import { Injectable } from '@nestjs/common'

import { AbstractTelemetryCollector } from './abstract-telemetry.collector'

@Injectable()
export class MetricCollector extends AbstractTelemetryCollector<any> {}
