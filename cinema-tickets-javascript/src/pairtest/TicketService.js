import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js'

export default class TicketService {
  #seatReservationService
  #ticketPaymentService
  #adultTicketPrice
  #childTicketPrice
  #infantTicketPrice

  /**
   * 
   * @param {SeatReservationService} seatReservationService 
   * @param {TicketPaymentService} ticketPaymentService
   * @param {int} adultTicketPrice
   * @param {int} childTicketPrice
   * @param {int} infantTicketPrice
   */
  constructor(
      seatReservationService,
      ticketPaymentService,
      adultTicketPrice = 20,
      childTicketPrice = 10,
      infantTicketPrice = 0,
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

    this.#seatReservationService = seatReservationService
    this.#ticketPaymentService = ticketPaymentService
    this.#adultTicketPrice = adultTicketPrice
    this.#childTicketPrice = childTicketPrice
    this.#infantTicketPrice = infantTicketPrice
  }

  /**
   * Work out 
   * 
   * @param TicketTypeRequest ticketTypeRequest 
   * @return Number
   */
  #requestPrice(ticketTypeRequest) {
    const prices = {
      'ADULT': this.#adultTicketPrice,
      'CHILD': this.#childTicketPrice,
      'INFANT': this.#infantTicketPrice,
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
      'ADULT': 1,
      'CHILD': 1,
      'INFANT': 0,
    }
    const type = ticketTypeRequest.getTicketType()
    return seats[type] * ticketTypeRequest.getNoOfTickets()
  }

    /**
     * @param TicketTypeRequest ticketTypeRequest 
     * @param String ticketType
     * @return Number
     */
    #requestPeopleCount(ticketTypeRequest, ticketType) {
      if (ticketTypeRequest.getTicketType() !== ticketType) {
        return 0
      }
      return ticketTypeRequest.getNoOfTickets()
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
    // TicketPaymentService.makePayment requires int account IDs. adhere to that.
    if (!Number.isInteger(accountId) || accountId < 0) {
      throw new InvalidPurchaseException("Missing account ID.")
    }

    // Require all ticket counts to be positive ints
    ticketTypeRequests.forEach((item) => {
      const noOfTickets = item.getNoOfTickets()
      if (!Number.isInteger(noOfTickets) || noOfTickets <= 0) {
        throw new InvalidPurchaseException("Ticket counts must be positive ints.")
      }
    })

    // work out how many seats are needed and what to charge
    var totalPrice = 0
    var totalSeats = 0
    var totalTickets = 0
    var totalInfants = 0
    var totalAdults = 0
    ticketTypeRequests.forEach((item) => {
      totalPrice += this.#requestPrice(item)
      totalSeats += this.#requestSeats(item)
      totalTickets += item.getNoOfTickets()
      totalInfants += this.#requestPeopleCount(item, 'INFANT')
      totalAdults += this.#requestPeopleCount(item, 'ADULT')
    })

    if (totalInfants > totalAdults) {
      const msg = 'Only one infant is allowed per adult.'
      throw new InvalidPurchaseException(msg)
    }

    if (totalTickets > 20) {
      const msg = 'No more than 20 tickets can be ordered at a time.'
      throw new InvalidPurchaseException(msg)
    }

    if (totalAdults <= 0) {
      const msg = 'There must be at least 1 adult per booking.'
      throw new InvalidPurchaseException(msg)
    }

    // make the payment and reserve the seats
    if (totalSeats > 0) {
      this.#ticketPaymentService.makePayment(accountId, totalPrice)
      this.#seatReservationService.reserveSeat(accountId, totalSeats)
    }
  }
}
