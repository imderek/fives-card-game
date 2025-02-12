require 'rails_helper'

RSpec.describe GameScoringService do
  let(:game) { create(:game, :pvp) }
  let(:service) { described_class.new(game) }

  describe '#update_column_scores' do
    before do
      game.board_cards = [
        { player_id: game.player1_id, column: 0, suit: '♠', value: 'A' },
        { player_id: game.player1_id, column: 0, suit: '♠', value: 'K' },
        { player_id: game.player2_id, column: 4, suit: '♥', value: '8' },
        { player_id: game.player2_id, column: 4, suit: '♦', value: '8' }
      ]
    end

    it 'updates column scores for both players' do
      service.update_column_scores
      
      expect(game.column_scores['0']).to eq(14)  # Ace high
      expect(game.column_scores['4']).to eq(100) # Pair of 8s
    end
  end

  describe '#complete_game' do
    context 'original setup' do
      before do
        game.board_cards = []
        
        # Player 1's columns (0-3)
        4.times do |col|
          5.times do |i|
            game.board_cards << {
              player_id: game.player1_id,
              column: col,
              suit: '♠',
              value: (i + 2).to_s
            }
          end
        end
        
        # Player 2's columns (4-7)
        4.times do |col|
          5.times do |i|
            game.board_cards << {
              player_id: game.player2_id,
              column: col + 4,
              suit: '♥',
              value: (i + 2).to_s
            }
          end
        end
        
        game.save!
      end

      it 'should complete with original setup' do
        service.complete_game
        game.reload
        expect(game.completed?).to be true
      end
    end

    context 'working setup' do
      before do
        game.board_cards = [
          # Player 1's royal flush
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'A' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'K' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'Q' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'J' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: '10' },
          
          *15.times.map { |i|
            { player_id: game.player1_id, column: 1 + (i / 5), suit: '♥', value: (i % 13 + 2).to_s }
          },
          
          *20.times.map { |i|
            { player_id: game.player2_id, column: 4 + (i / 5), suit: '♦', value: (i % 13 + 2).to_s }
          }
        ]
        game.save!
      end

      it 'should complete with working setup' do
        service.complete_game
        game.reload
        expect(game.completed?).to be true
      end
    end

    context 'when game is not complete' do
      it 'does not complete the game' do
        service.complete_game
        expect(game.reload.completed?).to be false
      end
    end

    context 'when game is complete' do
      before do
        # Set up a game with all columns having 5 cards
        game.board_cards = [
          # Player 1's royal flush
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'A' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'K' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'Q' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'J' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: '10' },
          
          *15.times.map { |i|
            { player_id: game.player1_id, column: 1 + (i / 5), suit: '♥', value: (i % 13 + 2).to_s }
          },
          
          *20.times.map { |i|
            { player_id: game.player2_id, column: 4 + (i / 5), suit: '♦', value: (i % 13 + 2).to_s }
          }
        ]
        game.save!
      end

      it 'completes the game and determines winner' do
        service.complete_game
        game.reload
        expect(game.completed?).to be true
        expect(game.winner_id).to eq(game.player1_id)
        expect(game.player1_total_score).to be > game.player2_total_score
      end
    end

    context 'when all columns are full' do
      before do
        # Same setup as above
        game.board_cards = [
          # Player 1's royal flush
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'A' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'K' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'Q' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'J' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: '10' },
          
          *15.times.map { |i|
            { player_id: game.player1_id, column: 1 + (i / 5), suit: '♥', value: (i % 13 + 2).to_s }
          },
          
          *20.times.map { |i|
            { player_id: game.player2_id, column: 4 + (i / 5), suit: '♦', value: (i % 13 + 2).to_s }
          }
        ]
        game.save!
      end

      it 'completes the game when all columns have exactly 5 cards' do
        expect(service.send(:game_complete?)).to be true
        service.complete_game
        expect(game.reload.completed?).to be true
      end

      it 'correctly identifies a game as complete even with empty columns' do
        game.board_cards = game.board_cards.reject { |card| [1, 5].include?(card[:column]) }
        game.save!
        expect(service.send(:game_complete?)).to be false
      end

      it 'requires all 8 columns to have exactly 5 cards' do
        game.board_cards.pop
        game.save!
        expect(service.send(:game_complete?)).to be false
      end
    end

    context 'with wild cards' do
      it 'correctly scores complex hand with multiple wild cards' do
        game.board_cards = [
          # Player 1's columns
          # Column 0: Two pair (Jacks and Fives)
          { player_id: game.player1_id, column: 0, suit: '♣', value: '5' },
          { player_id: game.player1_id, column: 0, suit: '♥', value: '5' },
          { player_id: game.player1_id, column: 0, suit: '♦', value: 'J' },
          { player_id: game.player1_id, column: 0, suit: '♣', value: 'J' },
          { player_id: game.player1_id, column: 0, suit: '♣', value: '9' },

          # Column 1: Full house (Three 6s over pair of Aces)
          { player_id: game.player1_id, column: 1, suit: '♦', value: '6' },
          { player_id: game.player1_id, column: 1, suit: '♥', value: '6' },
          { player_id: game.player1_id, column: 1, suit: '♣', value: '6' },
          { player_id: game.player1_id, column: 1, suit: '♦', value: 'A' },
          { player_id: game.player1_id, column: 1, suit: '♣', value: 'A' },

          # Column 2: Two pair (Queens and Threes)
          { player_id: game.player1_id, column: 2, suit: '♦', value: '3' },
          { player_id: game.player1_id, column: 2, suit: '♥', value: '3' },
          { player_id: game.player1_id, column: 2, suit: '♣', value: 'Q' },
          { player_id: game.player1_id, column: 2, suit: '♠', value: 'Q' },
          { player_id: game.player1_id, column: 2, suit: '♠', value: '5' },

          # Column 3: Straight Flush in Hearts (J,10,9,8,7 with wild cards as 10,7)
          { player_id: game.player1_id, column: 3, suit: '♥', value: 'J' },
          { player_id: game.player1_id, column: 3, suit: '♥', value: '9' },
          { player_id: game.player1_id, column: 3, suit: '★', value: 'W1' },
          { player_id: game.player1_id, column: 3, suit: '♥', value: '8' },
          { player_id: game.player1_id, column: 3, suit: '★', value: 'W2' },

          # Add player 2's columns (all need 5 cards each)
          # Column 4
          { player_id: game.player2_id, column: 4, suit: '♦', value: '2' },
          { player_id: game.player2_id, column: 4, suit: '♦', value: '3' },
          { player_id: game.player2_id, column: 4, suit: '♦', value: '4' },
          { player_id: game.player2_id, column: 4, suit: '♦', value: '5' },
          { player_id: game.player2_id, column: 4, suit: '♦', value: '6' },

          # Column 5
          { player_id: game.player2_id, column: 5, suit: '♣', value: '2' },
          { player_id: game.player2_id, column: 5, suit: '♣', value: '3' },
          { player_id: game.player2_id, column: 5, suit: '♣', value: '4' },
          { player_id: game.player2_id, column: 5, suit: '♣', value: '5' },
          { player_id: game.player2_id, column: 5, suit: '♣', value: '6' },

          # Column 6
          { player_id: game.player2_id, column: 6, suit: '♥', value: '2' },
          { player_id: game.player2_id, column: 6, suit: '♥', value: '3' },
          { player_id: game.player2_id, column: 6, suit: '♥', value: '4' },
          { player_id: game.player2_id, column: 6, suit: '♥', value: '5' },
          { player_id: game.player2_id, column: 6, suit: '♥', value: '6' },

          # Column 7
          { player_id: game.player2_id, column: 7, suit: '♠', value: '2' },
          { player_id: game.player2_id, column: 7, suit: '♠', value: '3' },
          { player_id: game.player2_id, column: 7, suit: '♠', value: '4' },
          { player_id: game.player2_id, column: 7, suit: '♠', value: '5' },
          { player_id: game.player2_id, column: 7, suit: '♠', value: '6' }
        ]

        # Player 1's hand
        game.player1_hand = [
          { suit: '♣', value: '7' },
          { suit: '♠', value: '8' },
          { suit: '♣', value: 'K' },
          { suit: '♣', value: '8' },
          { suit: '♠', value: 'K' },
          { suit: '♥', value: '7' }
        ]

        service.complete_game

        # Verify individual column scores
        expect(game.column_scores['0']).to eq(200)  # Two pair (Jacks and Fives)
        expect(game.column_scores['1']).to eq(600)  # Full house (Three 6s over Aces)
        expect(game.column_scores['2']).to eq(200)  # Two pair (Queens and Threes)
        expect(game.column_scores['3']).to eq(800)  # Straight flush in Hearts
        expect(game.column_scores['player1_hand']).to eq(200)  # Two pair (Kings and Eights)

        # Verify total score
        expect(game.player1_total_score).to eq(2000)  # Sum of all columns and hand (200+600+200+800+200)
      end
    end
  end
end 