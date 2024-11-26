import { Controller } from "@hotwired/stimulus"
import ApexCharts from "apexcharts"

export default class extends Controller {
  static values = {
    metric: String,
    defaultRange: { type: String, default: '7_days' }
  }

  async connect() {
    this.chart = null
    await this.fetchAndRenderChart()
    this.setupRangeSelector()
  }

  disconnect() {
    if (this.chart) {
      this.chart.destroy()
    }
  }

  async fetchAndRenderChart(range = this.defaultRangeValue) {
    const { startDate, endDate } = this.getDateRange(range)
    
    try {
      const response = await fetch(`/api/metrics/chart_data?` + new URLSearchParams({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        metric_name: "Total Sales" // TODO: Make this dynamic
      }))
      
      const data = await response.json()
      this.renderChart(data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  renderChart(data) {
    const options = {
      chart: {
        height: "300px",
        maxWidth: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (value) => {
            return data.unit === 'currency' 
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
              : data.unit === 'percentage'
                ? `${value}%`
                : value
          }
        }
      },
      markers: {
        size: 5,
        strokeColors: '#ffffff',
        hover: {
          size: undefined,
          sizeOffset: 3
        }
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 4,
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0
        },
      },
      series: [{
        name: this.metricValue.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        data: data.values,
        color: "#1A56DB"
      }],
      xaxis: {
        categories: data.dates,
        labels: {
          show: true,
          format: 'M/d',
          formatter: function(value) {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
          }
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            return data.unit === 'currency' 
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value)
              : data.unit === 'percentage'
                ? `${value}%`
                : value
          }
        }
      },
    }
    
    if (this.chart) {
      this.chart.destroy()
    }
    
    this.chart = new ApexCharts(this.element.querySelector("#area-chart"), options)
    this.chart.render()
  }

  getDateRange(range) {
    const endDate = new Date()
    let startDate

    switch (range) {
      case '7_days':
        startDate = new Date()
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30_days':
        startDate = new Date()
        startDate.setDate(endDate.getDate() - 30)
        break
      case 'ytd':
        startDate = new Date(endDate.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date()
        startDate.setDate(endDate.getDate() - 7)
    }

    return { startDate, endDate }
  }

  setupRangeSelector() {
    // Implement range selector logic here
  }
}
