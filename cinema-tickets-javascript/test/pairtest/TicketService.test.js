'use strict';

import TicketService from '../../src/pairtest/TicketService';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException';
import SeatReservationService from '../../src/thirdparty/seatbooking/SeatReservationService';
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest';

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
    expect(() => ticketService.purchaseTickets(-1))
        .toThrow(InvalidPurchaseException);
})

test('nothing happens if no tickets are being ordered', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    ticketService.purchaseTickets(12345)

    const mockSeatReservationInstance = SeatReservationService.mock.instances[0]
    const mockSeatReservation = mockSeatReservationInstance.reserveSeat
    const mockPaymentInstance = TicketPaymentService.mock.instances[0]
    const mockPayment = mockPaymentInstance.makePayment

    expect (mockSeatReservation).not.toHaveBeenCalled()
    expect (mockPayment).not.toHaveBeenCalled
})

test('allows 1 adult ticket to be bought and seat reserved', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    ticketService.purchaseTickets(12345, new TicketTypeRequest('ADULT', 1))

    const mockSeatReservationInstance = SeatReservationService.mock.instances[0]
    const mockSeatReservation = mockSeatReservationInstance.reserveSeat
    const mockPaymentInstance = TicketPaymentService.mock.instances[0]
    const mockPayment = mockPaymentInstance.makePayment

    expect (mockSeatReservation).toHaveBeenCalledTimes(1)
    expect (mockSeatReservation).toHaveBeenCalledWith(12345, 1)

    expect (mockPayment).toHaveBeenCalledTimes(1)
    expect (mockPayment).toHaveBeenCalledWith(12345, 10)
})

test('allows several adult tickets to be bought and seat reserved', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    ticketService.purchaseTickets(12345, new TicketTypeRequest('ADULT', 3))

    const mockSeatReservationInstance = SeatReservationService.mock.instances[0]
    const mockSeatReservation = mockSeatReservationInstance.reserveSeat
    const mockPaymentInstance = TicketPaymentService.mock.instances[0]
    const mockPayment = mockPaymentInstance.makePayment

    expect (mockSeatReservation).toHaveBeenCalledTimes(1)
    expect (mockSeatReservation).toHaveBeenCalledWith(12345, 3)

    expect (mockPayment).toHaveBeenCalledTimes(1)
    expect (mockPayment).toHaveBeenCalledWith(12345, 30)
})

// TODO: negative ticket counts
// TODO: non-numeric account numbers?
// TODO: configurable ticket prices
// TODO: multiple types ordered
// TODO: ordering more than 20 tickets in one request
// TODO: ordering more than 20 tickets in several requests