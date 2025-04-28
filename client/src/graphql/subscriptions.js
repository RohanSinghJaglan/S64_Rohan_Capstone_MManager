import { gql } from '@apollo/client';

export const APPOINTMENT_BOOKED_SUBSCRIPTION = gql`
  subscription AppointmentBooked {
    appointmentBooked {
      _id
      slotDate
      slotTime
      problem
      payment
      amount
      cancelled
      status
      createdAt
      userId {
        _id
        name
        email
      }
      doctorId {
        _id
        name
        specialization
      }
    }
  }
`;

export const APPOINTMENT_CANCELLED_SUBSCRIPTION = gql`
  subscription AppointmentCancelled {
    appointmentCancelled {
      _id
      slotDate
      slotTime
      cancelled
      cancellationReason
      status
      createdAt
      userId {
        _id
        name
        email
      }
      doctorId {
        _id
        name
        specialization
      }
    }
  }
`;

export const PAYMENT_COMPLETE_SUBSCRIPTION = gql`
  subscription PaymentComplete {
    paymentComplete {
      _id
      slotDate
      slotTime
      payment
      paymentId
      amount
      status
      userId {
        _id
        name
        email
      }
      doctorId {
        _id
        name
        specialization
      }
    }
  }
`; 