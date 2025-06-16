export interface MetricExportResponseDto {
  partialSuccess?: ExportMetricPartialSuccess
}

interface ExportMetricPartialSuccess {
  rejectedDataPoints?: number
  errorMessage?: string
}
