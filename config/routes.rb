Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  resources :deals

  # Devise routes
  # --------------
  devise_for :users, skip: [:sessions, :registrations]
  devise_scope :user do
    get '/users/sign_in', to: 'users/sessions#new', as: :new_user_session
    post '/users/sign_in', to: 'users/sessions#create', as: :user_session
    get '/users/sign_up', to: 'users/registrations#new', as: :new_user_registration
    post '/users', to: 'users/registrations#create', as: :user_registration
    delete '/users/sign_out', to: 'users/sessions#destroy', as: :destroy_user_session
  end
  # --------------

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  root "games#index"

  namespace :api do
    get 'metrics/chart_data', to: 'metrics#chart_data'
  end

  resources :games do
    member do
      post :play_card
      post :draw_card
      post :discard_card
      post :submit_bet
    end
  end

  resources :players, only: [:index]
end
