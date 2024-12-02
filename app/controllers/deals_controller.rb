class DealsController < ApplicationController
  before_action :set_deal, only: %i[ show edit update destroy ]
  before_action :authenticate_user!

  # GET /deals or /deals.json
  def index
    @deals = Deal.where(organization_id: current_user.organization_id).order(created_at: :desc)
  end

  # GET /deals/1 or /deals/1.json
  def show
    respond_to do |format|
      format.turbo_stream { render partial: "deals/deal", formats: [:html], locals: { deal: @deal } }
      format.html { render :show } # Optional fallback for regular HTML requests
    end
  end

  # GET /deals/new
  def new
    @deal = Deal.new
  end

  # GET /deals/1/edit
  def edit
  end

  # POST /deals or /deals.json
  def create
    @deal = Deal.new(deal_params.merge(organization_id: current_user.organization_id))

    respond_to do |format|
      if @deal.save
        format.html { redirect_to @deal, notice: "Deal was successfully created." }
        format.json { render :show, status: :created, location: @deal }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @deal.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /deals/1 or /deals/1.json
  def update
    respond_to do |format|
      if @deal.update(deal_params)
        format.html { redirect_to @deal, notice: "Deal was successfully updated." }
        format.json { render :show, status: :ok, location: @deal }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @deal.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /deals/1 or /deals/1.json
  def destroy
    @deal.destroy!

    respond_to do |format|
      format.html { redirect_to deals_path, status: :see_other, notice: "Deal was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_deal
      @deal = Deal.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def deal_params
      params.require(:deal).permit(:name, :description, :status, :amount, :organization_id, :close_date)
    end
end
