import { gql } from '@apollo/client';

// User queries
export const GET_USER_PROFILE = gql`
  query GetProfile {
    getProfile {
      _id
      name
      email
      phone
      address
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_APPOINTMENTS = gql`
  query GetAppointments {
    getAppointments {
      _id
      slotDate
      slotTime
      problem
      payment
      paymentId
      orderId
      amount
      cancelled
      cancellationReason
      status
      createdAt
      updatedAt
      userId {
        _id
        name
        email
        phone
      }
      doctorId {
        _id
        name
        specialization
        fees
        experience
        image
      }
    }
  }
`;

// Doctor queries
export const GET_DOCTORS = gql`
  query GetDoctors {
    getDoctors {
      _id
      name
      specialization
      experience
      fees
      about
      rating
      ratingCount
      isAvailable
      image
    }
  }
`;

export const GET_DOCTOR = gql`
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
      _id
      name
      email
      phone
      specialization
      experience
      fees
      about
      slots
      rating
      ratingCount
      isAvailable
      image
      createdAt
      updatedAt
    }
  }
`;

// Admin queries
export const GET_ALL_APPOINTMENTS = gql`
  query GetAllAppointments {
    getAllAppointments {
      _id
      slotDate
      slotTime
      problem
      payment
      paymentId
      orderId
      amount
      cancelled
      cancellationReason
      status
      createdAt
      updatedAt
      userId {
        _id
        name
        email
        phone
      }
      doctorId {
        _id
        name
        specialization
        fees
      }
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardStats {
      totalDoctors
      totalAppointments
      totalRevenue
      recentAppointments {
        _id
        slotDate
        slotTime
        amount
        status
        userId {
          name
          email
        }
        doctorId {
          name
          specialization
        }
      }
    }
  }
`; 