# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  # before_action :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  def create
    # Find user by email (case insensitive)
    email = params[:user][:email].downcase
    user = User.find_by("lower(email) = ?", email)

    if user
      # If user exists, sign them in
      if sign_in(user)
        redirect_to root_path, notice: "Signed in successfully!"
      else
        redirect_to new_user_session_path, alert: "Sign in failed."
      end
    else
      # If user doesn't exist, create a new user and sign them up
      user = User.new(email: email)
      user.organization = Organization.create(name: email)
      user.remember_me = true

      if user.save
        sign_in(user)
        redirect_to root_path, notice: "Signed up and signed in successfully!"
      else
        redirect_to new_user_session_path, alert: "Sign up failed."
      end
    end
  end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end
end
