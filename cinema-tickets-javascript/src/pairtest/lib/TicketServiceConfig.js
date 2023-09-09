/*
* This wraps and validates the config for the ticket service,
* to reduce clutter there
*/
export default class TicketServiceConfig {
  #adultTicketPrice;
  #childTicketPrice;
  #infantTicketPrice;
  #maxTicketsPerOrder;

  /**
   * @param {int} adultTicketPrice
   * @param {int} childTicketPrice
   * @param {int} infantTicketPrice
   * @param {int} maxTicketsPerOrder
   */
  constructor (
    adultTicketPrice = 20,
    childTicketPrice = 10,
    infantTicketPrice = 0,
    maxTicketsPerOrder = 20
  ) {
    if (!Number.isInteger(adultTicketPrice) || adultTicketPrice < 0) {
      throw new TypeError('adultTicketPrice must be a non-negative integer');
    }
    if (!Number.isInteger(childTicketPrice) || childTicketPrice < 0) {
      throw new TypeError('childTicketPrice must be a non-negative integer');
    }
    if (!Number.isInteger(infantTicketPrice) || infantTicketPrice < 0) {
      throw new TypeError('infantTicketPrice must be a non-negative integer');
    }
    if (!Number.isInteger(maxTicketsPerOrder) || maxTicketsPerOrder < 0) {
      throw new TypeError('infantTicketPrice must be a non-negative integer');
    }

    this.#adultTicketPrice = adultTicketPrice;
    this.#childTicketPrice = childTicketPrice;
    this.#infantTicketPrice = infantTicketPrice;
    this.#maxTicketsPerOrder = maxTicketsPerOrder;
  }

  getAdultTicketPrice () {
    return this.#adultTicketPrice;
  }

  getChildTicketPrice () {
    return this.#childTicketPrice;
  }

  getInfantTicketPrice () {
    return this.#infantTicketPrice;
  }

  getMaxTicketsPerOrder () {
    return this.#maxTicketsPerOrder;
  }
}
