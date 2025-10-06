export const schema = `
  type Quote {
    id: Int!
    content: String!
    author: String!
    totalLikes: Int!
    totalRatings: Int!
    averageRating: Float!
    createdAt: String!
    liked: Boolean
    userRating: Int
  }
    
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PaginationInfo {
    currentPage: Int!
    totalPages: Int!
    totalCount: Int!
  }

  type PaginatedQuotes {
    quotes: [Quote!]!
    pagination: PaginationInfo!
  }

  type Query {
    randomQuote: Quote
    likedQuotes(page: Int!): PaginatedQuotes!
    searchQuotes(term: String!, page: Int!): PaginatedQuotes!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): User!
    login(email: String!, password: String!): AuthPayload!
    likeQuote(quoteId: Int!): Quote!
    rateQuote(quoteId: Int!, rating: Int!): Quote!
  }
`;
