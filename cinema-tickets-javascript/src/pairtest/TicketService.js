import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import TicketServiceConfig from './lib/TicketServiceConfig.js';

export default class TicketService {
  #seatReservationService;
  #ticketPaymentService;
  #config;

  /**
   * @param {SeatReservationService} seatReservationService
   * @param {TicketPaymentService} ticketPaymentService
   * @param {TicketServiceConfig} TicketServiceConfig
   */
  constructor (
    seatReservationService,
    ticketPaymentService,
    ticketServiceConfig = new TicketServiceConfig()
  ) {
    this.#seatReservationService = seatReservationService;
    this.#ticketPaymentService = ticketPaymentService;
    this.#config = ticketServiceConfig;
  }

  /**
   * Work out the price of a particular ticket request
   *
   * @param TicketTypeRequest ticketTypeRequest
   * @return Number
   */
  #requestPrice (ticketTypeRequest) {
    const prices = {
      ADULT: this.#config.getAdultTicketPrice(),
      CHILD: this.#config.getChildTicketPrice(),
      INFANT: this.#config.getInfantTicketPrice()
    };
    const type = ticketTypeRequest.getTicketType();
    return prices[type] * ticketTypeRequest.getNoOfTickets();
  }

  /**
   * Work out the total number of seats in a ticket request
   *
   * @param TicketTypeRequest ticketTypeRequest
   * @return Number
   */
  #requestSeats (ticketTypeRequest) {
    const seats = {
      ADULT: 1,
      CHILD: 1,
      INFANT: 0
    };
    const type = ticketTypeRequest.getTicketType();
    return seats[type] * ticketTypeRequest.getNoOfTickets();
  }

  /**
   * Work out the number of people of a given type in a ticket request
   *
   * @param TicketTypeRequest ticketTypeRequest
   * @param String ticketType
   * @return Number
   */
  #requestPeopleCount (ticketTypeRequest, ticketType) {
    if (ticketTypeRequest.getTicketType() !== ticketType) {
      return 0;
    }
    return ticketTypeRequest.getNoOfTickets();
  }

  /**
   * A helper to make it tidier to assert constraints on requests
   *
   * @throws InvalidPurchaseException
   */
  #assert (condition, message) {
    if (!condition) {
      throw new InvalidPurchaseException(message);
    }
  }

  /**
   * Should only have private methods other than the one below.
   */

  /**
   * @param * accountId
   * @param TicketTypeRequest[] ticketTypeRequests
   * @throws InvalidPurchaseException
   */
  purchaseTickets (accountId, ...ticketTypeRequests) {
    // TicketPaymentService.makePayment requires int account IDs. adhere to that.
    this.#assert(
      Number.isInteger(accountId) && accountId >= 0,
      'Missing account ID.'
    );

    // work out how many seats are needed and what to charge
    let totalPrice, totalSeats, totalTickets, totalInfants, totalAdults;
    totalPrice = totalSeats = totalTickets = totalInfants = totalAdults = 0;
    ticketTypeRequests.forEach((item) => {
      totalPrice += this.#requestPrice(item);
      totalSeats += this.#requestSeats(item);
      totalTickets += item.getNoOfTickets();
      totalInfants += this.#requestPeopleCount(item, 'INFANT');
      totalAdults += this.#requestPeopleCount(item, 'ADULT');
    });

    // enforce business logic constraints
    const maxTickets = this.#config.getMaxTicketsPerOrder();
    this.#assert(totalTickets <= maxTickets, `No more than ${maxTickets} tickets at a time.`);
    this.#assert(totalInfants <= totalAdults, 'Only one infant allowed per adult.');
    this.#assert(totalAdults > 0, 'There must be at least 1 adult.');
    ticketTypeRequests.forEach((item) => {
      const noOfTickets = item.getNoOfTickets();
      this.#assert(
        Number.isInteger(noOfTickets) && noOfTickets > 0,
        'Ticket counts must be positive ints.'
      );
    });

    // make the payment and reserve the seats
    if (totalSeats > 0) {
      this.#ticketPaymentService.makePayment(accountId, totalPrice);
      this.#seatReservationService.reserveSeat(accountId, totalSeats);
    }
  }
}
