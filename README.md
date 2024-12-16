# Fives the Game

A web-based card game where you build poker hands that compete with an opponent's hands.

## Development Setup

### Prerequisites

* Ruby 3.2.0+
* Rails 7.0+
* PostgreSQL
* Node.js 16+
* Yarn

### Installation

1. Clone the repository
2. Install dependencies: `bundle install`
3. Set up the database: `rails db:setup`
4. Start the server: `bin/dev -p 3001`
5. Visit `http://localhost:3001` in your browser

## Testing

Run the test suite with:

```bash
bundle exec rspec
```

## Deployment

The application automatically deploys to Render whenever changes are pushed to the `main` branch and the tests pass.

## Features

* Real-time card games with WebSocket support
* User authentication
* Game matchmaking
* AI opponents
* Leaderboard system

## License

This project is licensed under the MIT License.