import TicketService from '../../src/pairtest/TicketService';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException';

'use strict';

test('rejects calls with missing account ID', () => {
    var ticketService = new TicketService();
    expect(() => ticketService.purchaseTickets())
        .toThrow(InvalidPurchaseException);
})

test('rejects calls with negative account ID', () => {
    var ticketService = new TicketService();
    expect(() => ticketService.purchaseTickets(-1, []))
        .toThrow(InvalidPurchaseException);
})

// test('allows 1 adult ticket to be bought and seat reserved', () => {
//     var ticketService = new TicketService()
// })