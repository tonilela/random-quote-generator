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

  type Query {
    randomQuote: Quote
    likedQuotes: [Quote!]
    searchQuotes(term: String!, page: String!): [Quote!]
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): User!
    login(email: String!, password: String!): AuthPayload!
    likeQuote(quoteId: Int!): Quote!
    rateQuote(quoteId: Int!, rating: Int!): Quote!
  }
`;
