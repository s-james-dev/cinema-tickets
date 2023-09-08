'use strict';

import TicketService from '../../src/pairtest/TicketService';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException';
import SeatReservationService from '../../src/thirdparty/seatbooking/SeatReservationService';
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest';

// See https://jestjs.io/docs/es6-class-mocks
jest.mock('../../src/thirdparty/seatbooking/SeatReservationService');
jest.mock('../../src/thirdparty/paymentgateway/TicketPaymentService');

beforeEach(() => {
  SeatReservationService.mockClear();
  TicketPaymentService.mockClear();
});

test('rejects calls with missing account ID', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets())
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it rejects calls with negative account ID', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets(-1))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it rejects non-numeric account ID', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets('hello'))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it won\'t allow bookings with no tickets', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets(12345))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it allows 1 adult ticket to be bought and seat reserved', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  ticketService.purchaseTickets(12345, new TicketTypeRequest('ADULT', 1));

  const mockSeatReservation = _getFirstSeatReservation();
  expect(mockSeatReservation).toHaveBeenCalledTimes(1);
  expect(mockSeatReservation).toHaveBeenCalledWith(12345, 1);

  const mockPayment = _getFirstPayment();
  expect(mockPayment).toHaveBeenCalledTimes(1);
  expect(mockPayment).toHaveBeenCalledWith(12345, 20);
});

test('it allows several adult tickets to be bought and seat reserved', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  ticketService.purchaseTickets(12345, new TicketTypeRequest('ADULT', 3));

  const mockSeatReservation = _getFirstSeatReservation();
  expect(mockSeatReservation).toHaveBeenCalledTimes(1);
  expect(mockSeatReservation).toHaveBeenCalledWith(12345, 3);

  const mockPayment = _getFirstPayment();
  expect(mockPayment).toHaveBeenCalledTimes(1);
  expect(mockPayment).toHaveBeenCalledWith(12345, 60);
});

test('it does not allow negative ticket counts', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets(
    12345,
    new TicketTypeRequest('ADULT', 3),
    new TicketTypeRequest('ADULT', -1)
  ))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it does not allow more than 20 tickets to be ordered in one request', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets(
    12345,
    new TicketTypeRequest('ADULT', 21)
  ))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it does not allow more than 20 tickets to be ordered', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets(
    12345,
    new TicketTypeRequest('ADULT', 10),
    new TicketTypeRequest('ADULT', 11)
  ))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it charges the correct amount for child seats', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  ticketService.purchaseTickets(
    12345,
    new TicketTypeRequest('ADULT', 2),
    new TicketTypeRequest('CHILD', 3)
  );

  const mockSeatReservation = _getFirstSeatReservation();
  expect(mockSeatReservation).toHaveBeenCalledTimes(1);
  expect(mockSeatReservation).toHaveBeenCalledWith(12345, 5);

  const mockPayment = _getFirstPayment();
  expect(mockPayment).toHaveBeenCalledTimes(1);
  expect(mockPayment).toHaveBeenCalledWith(12345, 70);
});

test('it does not charge for an infant ticket or reserve a seat', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  ticketService.purchaseTickets(
    12345,
    new TicketTypeRequest('ADULT', 1),
    new TicketTypeRequest('INFANT', 1)
  );

  const mockSeatReservation = _getFirstSeatReservation();
  expect(mockSeatReservation).toHaveBeenCalledTimes(1);
  expect(mockSeatReservation).toHaveBeenCalledWith(12345, 1);

  const mockPayment = _getFirstPayment();
  expect(mockPayment).toHaveBeenCalledTimes(1);
  expect(mockPayment).toHaveBeenCalledWith(12345, 20);
});

test('it only allows one infant per adult', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets(
    12345,
    new TicketTypeRequest('ADULT', 1),
    new TicketTypeRequest('INFANT', 2)
  ))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it won\'t allow a child without at least 1 adult', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets(
    12345,
    new TicketTypeRequest('CHILD', 1)
  ))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

test('it won\'t allow an infant without at least 1 adult', () => {
  const ticketService = new TicketService(
    new SeatReservationService(),
    new TicketPaymentService()
  );
  expect(() => ticketService.purchaseTickets(
    12345,
    new TicketTypeRequest('INFANT', 1)
  ))
    .toThrow(InvalidPurchaseException);

  _assertNoTicketServicesUsed();
});

/**
 * A helper to check that the mock payment / reservation services were not used
 */
function _assertNoTicketServicesUsed () {
  const mockSeatReservationInstance = SeatReservationService.mock.instances[0];
  const mockSeatReservation = mockSeatReservationInstance.reserveSeat;
  const mockPaymentInstance = TicketPaymentService.mock.instances[0];
  const mockPayment = mockPaymentInstance.makePayment;

  expect(mockSeatReservation).not.toHaveBeenCalled();
  expect(mockPayment).not.toHaveBeenCalled();
}

/**
 * A helper to get the first seat reservation made with the mock service
 * @returns mockSeatReservation
 */
function _getFirstSeatReservation () {
  const mockSeatReservationInstance = SeatReservationService.mock.instances[0];
  const mockSeatReservation = mockSeatReservationInstance.reserveSeat;
  return mockSeatReservation;
}

/**
 * A helper to get the first seat payment made with the mock service
 * @returns mockSeatReservation
 */
function _getFirstPayment () {
  const mockPaymentInstance = TicketPaymentService.mock.instances[0];
  const mockPayment = mockPaymentInstance.makePayment;
  return mockPayment;
}

// TODO: pluggable constraint lib?
