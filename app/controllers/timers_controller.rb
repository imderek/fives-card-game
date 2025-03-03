class TimersController < ApplicationController
  before_action :set_skip_header

  def new
  end

  private

  def set_skip_header
    @skip_header = true
  end
end
