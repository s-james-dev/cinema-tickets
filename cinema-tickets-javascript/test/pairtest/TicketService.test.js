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

test('rejects non-numeric account ID', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    expect(() => ticketService.purchaseTickets('hello'))
        .toThrow(InvalidPurchaseException)
})

test('nothing happens if no tickets are being ordered', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    ticketService.purchaseTickets(12345)

    assertNoTicketServicesUsed()
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

test('does not allow negative ticket counts', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    expect(() => ticketService.purchaseTickets(12345,
                new TicketTypeRequest('ADULT', 3),
                new TicketTypeRequest('ADULT', -1),
            )
        )
    .toThrow(InvalidPurchaseException)

    assertNoTicketServicesUsed()
})

test('does not allow more than 20 tickets to be ordered in one request', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    expect(() => ticketService.purchaseTickets(12345,
                new TicketTypeRequest('ADULT', 21),
            )
        )
    .toThrow(InvalidPurchaseException)

    assertNoTicketServicesUsed()
})

test('does not allow more than 20 tickets to be ordered', () => {
    var ticketService = new TicketService(
        new SeatReservationService(),
        new TicketPaymentService()
    )
    expect(() => ticketService.purchaseTickets(12345,
                new TicketTypeRequest('ADULT', 10),
                new TicketTypeRequest('ADULT', 11),
            )
        )
    .toThrow(InvalidPurchaseException)

    assertNoTicketServicesUsed()
})

function assertNoTicketServicesUsed() {
    const mockSeatReservationInstance = SeatReservationService.mock.instances[0]
    const mockSeatReservation = mockSeatReservationInstance.reserveSeat
    const mockPaymentInstance = TicketPaymentService.mock.instances[0]
    const mockPayment = mockPaymentInstance.makePayment

    expect (mockSeatReservation).not.toHaveBeenCalled()
    expect (mockPayment).not.toHaveBeenCalled()
}

// TODO: configurable ticket prices
// TODO: child / infant tickets without adult
// TODO: infants not allocated a seat