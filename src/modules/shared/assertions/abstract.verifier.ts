export abstract class Verifier<Model, Parent = void> {
  constructor(
    protected readonly model: Partial<Model>,
    protected readonly assertions: Verifier<Model, Parent>[],
    protected readonly originalStack?: string,
  ) {}

  abstract verify(data: Model[]): void

  abstract matches(data: Model): boolean
}
