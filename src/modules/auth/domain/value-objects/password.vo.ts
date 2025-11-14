export class Password {
  private readonly _value: string;
  constructor(password: string, isHashed: boolean = false) {
    if (!isHashed) {
      this.validate();
    }
  }
  private validate(): void {
    console.log(this._value);
    if (this._value.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const hasUpperCase = /[A-Z]/.test(this._value);
    const hasLowerCase = /[a-z]/.test(this._value);
    const hasNumber = /\d/.test(this._value);
    const hasSpecialChar = /[@$!%*?&]/.test(this._value);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new Error(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    }
  }

  get value(): string {
    return this._value;
  }
}
