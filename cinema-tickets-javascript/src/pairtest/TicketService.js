import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
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
