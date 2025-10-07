# Random Quote Generator

A full-stack quote generator application built with Fastify, React, PostgreSQL, and GraphQL. Generate, like, rate, and search through thousands of inspirational quotes.

# Features

* Random Quote Generation: Get random quotes from a database of 1400+ quotes
* User Authentication: JWT-based authentication system
* Quote Interactions: Like and rate your favorite quotes (1-5 stars)
* Search Functionality: Search quotes by content or author
* GraphQL API: Modern GraphQL endpoint alongside REST APIs
* Responsive Frontend: Clean React interface
* Database Seeding: Automatic quote population from DummyJSON API

# Tech Stack

## Backend:

Fastify (Node.js framework)

TypeScript

PostgreSQL with Sequelize ORM

GraphQL with Mercurius

JWT Authentication

Docker

## Frontend:

React

TypeScript

Docker

## Quick Start

Prerequisites
Docker and Docker Compose

### Git

Clone the Repository

```
git clone <repo-url>
cd random-quote-generator
```

Environment Setup
Copy the environment example file:

```
cp .env.example .env
```

The .env file contains all necessary configuration for Docker Compose including database credentials, API URLs, and JWT secrets.

Start the Application
Build and start all services:

```
docker-compose up --build -d
```

This command will:

* Build the backend (Fastify API)
* Build the frontend (React app)
* Start PostgreSQL database
* Set up networking between services

### Seed the Database

After containers are running, populate the database with quotes:

```
docker-compose exec server npm run seed
```

This will fetch and store 1400+ quotes from the DummyJSON API.

Access the Application
Frontend: `http://localhost:3000`

Backend API: `http://localhost:3001`

GraphiQL Interface: `http://localhost:3001/graphiql`

Database: localhost:5433 (PostgreSQL).

# Development Commands

#### View logs

```
docker-compose logs -f
```

#### Stop services

```
docker-compose down
```

#### Rebuild specific service

```
docker-compose up --build server
```

#### Access backend container

```
docker-compose exec server bash
```

## API Endpoints

##### REST API

```
GET /api/quotes/random - Get random quote
POST /api/quotes/:id/like - Like a quote
POST /api/quotes/:id/rate - Rate a quote (1-5)
GET /api/quotes/search?q=term - Search quotes
GET /api/quotes/liked - Get user's liked quotes
POST /api/auth/register - User registration
POST /api/auth/login - User login
```

GraphQL
Access the GraphiQL interface at `http://localhost:3001/graphiql` to explore available queries and mutations.

Docker Services
db: PostgreSQL database

server: Fastify backend API

client: React frontend application

Complete Reset
To start completely fresh:

##### Remove all containers, images, and volumes

```
docker-compose down --rmi all -v --remove-orphans
docker system prune -a -f
```

##### Rebuild everything

```
docker-compose up --build -d
```

##### Re-seed database

```
docker-compose exec server npm run seed
```

# 🚀 Production Deployment

This application is deployed on Heroku using separate apps for frontend and backend:

Live Application
Frontend: https://quote-gen-frontend-a50dcae2aad1.herokuapp.com/
