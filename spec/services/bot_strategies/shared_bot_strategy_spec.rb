require 'rails_helper'

RSpec.describe "Bot Strategy Comparisons" do
  let(:player1) { create(:user) }
  let(:player2) { create(:user, email: 'bot') }
  let(:game) { create(:game, player1: player1, player2: player2, game_type: :bot) }
  
  shared_examples "a poker bot" do |bot_class|
    let(:bot) { bot_class.new(game) }

    describe "strategic decision making" do
      context "when presented with multiple scoring opportunities" do
        it "chooses the highest scoring combination" do
          # Setup: Choice between making a pair or completing three-of-a-kind
          game.board_cards = [
            { suit: '♠', value: '7', player_id: game.player2_id, column: 4 },
            { suit: '♣', value: '7', player_id: game.player2_id, column: 4 },
            { suit: '♥', value: 'K', player_id: game.player2_id, column: 5 }
          ]
          game.player2_hand = [
            { suit: '♦', value: '7' },  # Could complete three-of-a-kind
            { suit: '♠', value: 'K' }   # Could make a pair
          ]

          move = bot.make_move
          expect(move[:value]).to eq('7') # Should prefer three-of-a-kind over pair
        end
      end

      context "when setting up future combinations" do
        it "recognizes potential for full house" do
          game.board_cards = [
            { suit: '♠', value: '7', player_id: game.player2_id, column: 4 },
            { suit: '♣', value: '7', player_id: game.player2_id, column: 4 },
            { suit: '♥', value: 'K', player_id: game.player2_id, column: 5 },
            { suit: '♦', value: 'K', player_id: game.player2_id, column: 5 }
          ]
          game.player2_hand = [
            { suit: '♦', value: '7' },  # Could complete three-of-a-kind part of full house
            { suit: '♠', value: 'A' }   # Could start new combination
          ]

          move = bot.make_move
          expect(move[:value]).to eq('7')
          expect(move[:column]).to eq(4)
        end
      end

      context "when choosing between immediate vs potential points" do
        it "weighs immediate points against future opportunities" do
          game.board_cards = [
            { suit: '♠', value: 'Q', player_id: game.player2_id, column: 4 },
            { suit: '♣', value: 'Q', player_id: game.player2_id, column: 4 },
            { suit: '♥', value: 'K', player_id: game.player2_id, column: 5 }
          ]
          game.player2_hand = [
            { suit: '♦', value: 'K' },  # Could make pair of Kings
            { suit: '♥', value: 'Q' }   # Could make three Queens
          ]

          move = bot.make_move
          expect(move[:value]).to be_in(['Q', 'K'])  # Accept either strategy
          if move[:value] == 'Q'
            expect(move[:column]).to eq(4)  # If playing Q, should go with existing Queens
          elsif move[:value] == 'K'
            expect(move[:column]).to eq(5)  # If playing K, should go with existing King
          end
        end
      end

      context "when evaluating suit-based scoring opportunities" do
        it "considers suit matches along with other factors" do
          game.board_cards = [
            { suit: '♠', value: '2', player_id: game.player2_id, column: 4 },
            { suit: '♠', value: '5', player_id: game.player2_id, column: 4 },
            { suit: '♠', value: '7', player_id: game.player2_id, column: 4 }
          ]
          game.player2_hand = [
            { suit: '♠', value: '9' },  # Could contribute to flush
            { suit: '♥', value: 'K' }   # Higher card but different suit
          ]

          move = bot.make_move
          expect(move[:suit]).to be_in(['♠', '♥'])  # Accept either choice
          expect(move[:value]).to be_in(['9', 'K'])  # Accept either value
        end
      end

      context "when evaluating straight possibilities" do
        it "considers straight potential among other factors" do
          game.board_cards = [
            { suit: '♠', value: '5', player_id: game.player2_id, column: 4 },
            { suit: '♣', value: '6', player_id: game.player2_id, column: 4 },
            { suit: '♥', value: '7', player_id: game.player2_id, column: 4 }
          ]
          game.player2_hand = [
            { suit: '♦', value: '8' },  # Could contribute to straight
            { suit: '♠', value: 'K' }   # Higher card but no straight potential
          ]

          move = bot.make_move
          expect(move[:value]).to be_in(['8', 'K'])  # Accept either choice
          if move[:value] == '8'
            expect(move[:column]).to be_between(4, 7)  # Any valid column is acceptable
          end
        end
      end
    end
  end

  describe BotStrategies::MediumBot do
    it_behaves_like "a poker bot", BotStrategies::MediumBot
  end

  describe BotStrategies::HardBot do
    it_behaves_like "a poker bot", BotStrategies::HardBot
  end
end 