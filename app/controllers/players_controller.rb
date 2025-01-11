class PlayersController < ApplicationController
  before_action :authenticate_user!

  def index
    @players = User.where.not("LOWER(email) LIKE ? OR LOWER(email) LIKE ?", 
                             "%bot%", 
                             "%Bot%")
                   .select(
                     "users.*, " \
                     "COUNT(DISTINCT CASE WHEN games.game_type = #{Game.game_types[:pvp]} THEN games.id END) as pvp_games_count, " \
                     "COUNT(DISTINCT CASE WHEN games.game_type = #{Game.game_types[:bot]} THEN games.id END) as bot_games_count, " \
                     "COALESCE(MAX(CASE WHEN games.player1_id = users.id THEN games.player1_total_score " \
                         "WHEN games.player2_id = users.id THEN games.player2_total_score END), 0) as top_score"
                   )
                   .left_joins(:games_as_player1, :games_as_player2)
                   .group(:id)
                   .order(Arel.sql("COALESCE(last_active_at, DATE('1970-01-01')) DESC"))
  end
end 