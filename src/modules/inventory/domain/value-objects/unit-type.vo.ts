export class UnitType {
  constructor(private readonly value: string) {}
  equals(other: UnitType) {}
  toString() {}
  isMeasurable() {}
}
