FactoryBot.define do
  factory :game do
    association :player1, factory: :user
    association :player2, factory: :user
    status { 'in_progress' }
    game_type { 'pvp' }
    board_cards { [] }
    deck { [] }
    player1_hand { [] }
    player2_hand { [] }
  end
end 