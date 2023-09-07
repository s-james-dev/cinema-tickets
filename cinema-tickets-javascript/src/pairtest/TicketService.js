import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js'

export default class TicketService {
  #seatReservationService
  #ticketPaymentService

  /**
   * 
   * @param {SeatReservationService} seatReservationService 
   * @param {TicketPaymentService} ticketPaymentService 
   */
  constructor(seatReservationService, ticketPaymentService) {
    this.#seatReservationService = seatReservationService
    this.#ticketPaymentService = ticketPaymentService
  }

  /**
   * Should only have private methods other than the one below.
   */

  /**
   * @param {*} accountId 
   * @param  {...any} ticketTypeRequests 
   * @throws InvalidPurchaseException
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!accountId || accountId < 0) {
      throw new InvalidPurchaseException("Missing account ID.")
    }
  }
}
