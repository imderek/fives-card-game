class ApplicationController < ActionController::Base
  before_action :update_last_active_at, if: :user_signed_in?

  protected

  def after_sign_in_path_for(resource)
    root_path
  end

  def after_sign_out_path_for(scope)
    new_user_session_path
  end

  private

  def update_last_active_at
    current_user.touch(:last_active_at)
  end
end
