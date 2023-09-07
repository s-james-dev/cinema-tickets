'use strict';

import TicketService from '../../src/pairtest/TicketService';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException';
import SeatReservationService from '../../src/thirdparty/seatbooking/SeatReservationService';
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService';

// See https://jestjs.io/docs/es6-class-mocks
jest.mock('../../src/thirdparty/seatbooking/SeatReservationService')
jest.mock('../../src/thirdparty/paymentgateway/TicketPaymentService')

beforeEach(() => {
    SeatReservationService.mockClear()
    TicketPaymentService.mockClear()
})

test('rejects calls with missing account ID', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    expect(() => ticketService.purchaseTickets())
        .toThrow(InvalidPurchaseException)
})

test('rejects calls with negative account ID', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    expect(() => ticketService.purchaseTickets(-1, []))
        .toThrow(InvalidPurchaseException);
})

test('nothing happens if no tickets are being ordered', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )

    const mockSeatReservationInstance = SeatReservationService.mock.instances[0]
    const mockSeatReservation = mockSeatReservationInstance.reserveSeat

    const mockPaymentInstance = TicketPaymentService.mock.instances[0]
    const mockPayment = mockPaymentInstance.makePayment

    expect (mockSeatReservation).not.toHaveBeenCalled()
    expect (mockPayment).not.toHaveBeenCalled
})

// test('allows 1 adult ticket to be bought and seat reserved', () => {
//     var ticketService = new TicketService()
// })