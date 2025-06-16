import { Verifier } from './abstract.verifier'

export abstract class Builder<Model, Parent = void, Child = void> {
  protected abstract verifierClass: new (
    model: Partial<Model>,
    assertions: Verifier<Model, Parent>[],
    originalStack?: string,
  ) => Verifier<Model, Parent>

  protected readonly childAssertions: Verifier<Child, this>[] = []
  protected readonly model: Partial<Model> = {}

  constructor(
    protected readonly parent: Parent,
    private readonly parentAssertions: Verifier<Model, Parent>[],
  ) {}

  assert(): Parent {
    const error = new Error()

    // eslint-disable-next-line @typescript-eslint/unbound-method
    Error.captureStackTrace(error, this.assert)
    const originalStack = error.stack

    this.parentAssertions.push(new this.verifierClass(this.model, this.childAssertions, originalStack))

    return this.parent
  }
}
