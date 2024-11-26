module Api
  class MetricsController < ApplicationController
    def chart_data
      start_date = Date.parse(params[:start_date])
      end_date = Date.parse(params[:end_date])
      metric_name = params[:metric_name]

      metrics = Metric.where(name: metric_name)
                      .where('period_start >= ? AND period_end <= ?', start_date, end_date)
                      .order(period_start: :asc)

      render json: {
        dates: metrics.map { |m| m.period_start.strftime('%Y-%m-%d') },
        values: metrics.map(&:value),
        unit: metrics.first&.unit
      }
    end
  end
end 