import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  constructor() {}

  /**
   * generates account numbers
   * @returns account number code
   */
  generateAccountNumber(): string {
    const characters = '0123456789';
    let accountNumber = '';

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      accountNumber += characters.charAt(randomIndex);
    }
    return accountNumber;
  }
}
