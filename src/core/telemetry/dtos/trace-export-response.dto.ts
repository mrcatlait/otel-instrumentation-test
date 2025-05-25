export interface TraceExportResponseDto {
  partialSuccess?: ExportTracePartialSuccess
}

interface ExportTracePartialSuccess {
  rejectedSpans?: number
  errorMessage?: string
}
