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
   * Work out 
   * 
   * @param TicketTypeRequest ticketTypeRequest 
   * @return Number
   */
  #requestPrice(ticketTypeRequest) {
    const prices = {
      "ADULT": 10,
    }
    const type = ticketTypeRequest.getTicketType()
    return prices[type] * ticketTypeRequest.getNoOfTickets()
  }

  /**
   * @param TicketTypeRequest ticketTypeRequest 
   * @return Number
   */
  #requestSeats(ticketTypeRequest) {
    const seats = {
      "ADULT": 1,
    }
    const type = ticketTypeRequest.getTicketType()
    return seats[type] * ticketTypeRequest.getNoOfTickets()
  }

  /**
   * Should only have private methods other than the one below.
   */

  /**
   * @param * accountId 
   * @param TicketTypeRequest[] ticketTypeRequests 
   * @throws InvalidPurchaseException
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!accountId || accountId < 0) {
      throw new InvalidPurchaseException("Missing account ID.")
    }

    // work out how many seats are needed and what to charge
    var totalPrice = 0
    var totalSeats = 0
    ticketTypeRequests.forEach((item) => {
      totalPrice += this.#requestPrice(item)
      totalSeats += this.#requestSeats(item)
    })

    // make the payment and reserve the seats
    if (totalSeats > 0) {
      this.#ticketPaymentService.makePayment(accountId, totalPrice)
      this.#seatReservationService.reserveSeat(accountId, totalSeats)
    }
  }
}
