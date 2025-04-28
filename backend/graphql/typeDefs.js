import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    phone: String
    address: String
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Doctor {
    _id: ID!
    name: String!
    email: String!
    phone: String!
    specialization: String!
    experience: Int!
    fees: Int!
    about: String
    slots: [Slot]
    rating: Float
    ratingCount: Int
    isAvailable: Boolean!
    image: String
    createdAt: String!
    updatedAt: String!
  }

  type Slot {
    slotDate: String!
    slotTime: String!
    booked: Boolean!
  }

  type Appointment {
    _id: ID!
    userId: User!
    doctorId: Doctor!
    slotDate: String!
    slotTime: String!
    problem: String
    payment: Boolean!
    paymentId: String
    orderId: String
    amount: Int!
    cancelled: Boolean!
    cancellationReason: String
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User
    token: String!
    refreshToken: String!
  }

  type RazorpayOrder {
    id: String!
    amount: Int!
    currency: String!
  }

  type DashboardStats {
    totalDoctors: Int!
    totalAppointments: Int!
    totalRevenue: Int!
    recentAppointments: [Appointment!]!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    phone: String
    address: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input AppointmentInput {
    doctorId: ID!
    slotDate: String!
    slotTime: String!
    problem: String
  }

  input DoctorInput {
    name: String!
    email: String!
    phone: String!
    specialization: String!
    experience: Int!
    fees: Int!
    about: String
    isAvailable: Boolean!
    image: String
  }

  type Query {
    # User queries
    getProfile: User
    getAppointments: [Appointment!]!
    
    # Doctor queries
    getDoctors: [Doctor!]!
    getDoctor(id: ID!): Doctor
    
    # Admin queries
    getAllAppointments: [Appointment!]!
    getDashboardStats: DashboardStats!
  };

  type Mutation {
    # Auth mutations
    registerUser(input: RegisterInput!): AuthPayload!
    loginUser(input: LoginInput!): AuthPayload!
    refreshToken(token: String!): String!
    
    # Appointment mutations
    bookAppointment(input: AppointmentInput!): Appointment!
    cancelAppointment(id: ID!): Appointment!
    
    # Payment mutations
    createRazorpayOrder(appointmentId: ID!): RazorpayOrder!
    verifyRazorpayPayment(orderId: String!, paymentId: String!, signature: String!): Appointment!
    
    # Admin mutations
    addDoctor(input: DoctorInput!): Doctor!
    updateDoctor(id: ID!, input: DoctorInput!): Doctor!
  };
   type Subscription {
    appointmentBooked: Appointment!
    appointmentCancelled: Appointment!
    paymentComplete: Appointment!
  }
`;

  export default typeDefs; 