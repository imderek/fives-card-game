class DashboardsController < ApplicationController
  before_action :authenticate_user!

  def show
    @metrics = Metric.where(
      organization_id: current_user.organization_id,
      period_start: Time.current.beginning_of_month,
      period_end: Time.current.end_of_month
    )
    @total_sales_metric = @metrics.where(name: "Total Sales").first
    @win_rate_metric = @metrics.where(name: "Win Rate").first
    @conversion_rate_metric = @metrics.where(name: "Conversion Rate").first
    @pipeline_value_metric = @metrics.where(name: "Pipeline Value").first
  end
end
