export class MovementType {
  constructor(private readonly type: string) {}
  isPositive() {}
  isNegative() {}
  equals(other: MovementType) {}
}
