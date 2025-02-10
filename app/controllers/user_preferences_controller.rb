class UserPreferencesController < ApplicationController
  def update
    current_user.set_preference(params[:key], params[:value])
    head :ok
  end
end 