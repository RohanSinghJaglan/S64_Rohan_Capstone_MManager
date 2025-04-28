import { gql } from '@apollo/client';

// Auth mutations
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      user {
        _id
        name
        email
        phone
        address
        role
      }
      token
      refreshToken
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    loginUser(input: $input) {
      user {
        _id
        name
        email
        phone
        address
        role
      }
      token
      refreshToken
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token)
  }
`;

// Appointment mutations
export const BOOK_APPOINTMENT = gql`
  mutation BookAppointment($input: AppointmentInput!) {
    bookAppointment(input: $input) {
      _id
      slotDate
      slotTime
      problem
      payment
      amount
      cancelled
      status
      userId {
        _id
        name
      }
      doctorId {
        _id
        name
        specialization
      }
    }
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($id: ID!) {
    cancelAppointment(id: $id) {
      _id
      cancelled
      cancellationReason
      status
    }
  }
`;

// Payment mutations
export const CREATE_RAZORPAY_ORDER = gql`
  mutation CreateRazorpayOrder($appointmentId: ID!) {
    createRazorpayOrder(appointmentId: $appointmentId) {
      id
      amount
      currency
    }
  }
`;

export const VERIFY_RAZORPAY_PAYMENT = gql`
  mutation VerifyRazorpayPayment(
    $orderId: String!
    $paymentId: String!
    $signature: String!
  ) {
    verifyRazorpayPayment(
      orderId: $orderId
      paymentId: $paymentId
      signature: $signature
    ) {
      _id
      payment
      paymentId
      status
    }
  }
`;

// Admin mutations
export const ADD_DOCTOR = gql`
  mutation AddDoctor($input: DoctorInput!) {
    addDoctor(input: $input) {
      _id
      name
      email
      phone
      specialization
      experience
      fees
      about
      isAvailable
      image
    }
  }
`;

export const UPDATE_DOCTOR = gql`
  mutation UpdateDoctor($id: ID!, $input: DoctorInput!) {
    updateDoctor(id: $id, input: $input) {
      _id
      name
      email
      phone
      specialization
      experience
      fees
      about
      isAvailable
      image
      updatedAt
    }
  }
`; 