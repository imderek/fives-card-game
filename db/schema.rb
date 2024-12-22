# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_12_22_165142) do
  create_table "contact_deals", force: :cascade do |t|
    t.integer "contact_id", null: false
    t.integer "deal_id", null: false
    t.boolean "primary", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id"], name: "index_contact_deals_on_contact_id"
    t.index ["deal_id"], name: "index_contact_deals_on_deal_id"
  end

  create_table "contacts", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "phone"
    t.boolean "primary"
    t.integer "organization_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_contacts_on_organization_id"
  end

  create_table "deals", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "status"
    t.integer "organization_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "amount", precision: 10, scale: 2
    t.date "close_date"
    t.integer "owner_id"
    t.index ["organization_id"], name: "index_deals_on_organization_id"
    t.index ["owner_id"], name: "index_deals_on_owner_id"
  end

  create_table "games", force: :cascade do |t|
    t.integer "player1_id", null: false
    t.integer "player2_id"
    t.integer "status", default: 0
    t.integer "game_type", default: 0
    t.text "player1_hand"
    t.text "player2_hand"
    t.text "board_cards"
    t.text "deck"
    t.bigint "current_turn"
    t.bigint "winner_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "turn_phase", default: 0
    t.json "column_scores", default: {}
    t.text "player1_discard_pile"
    t.text "player2_discard_pile"
    t.index ["player1_id"], name: "index_games_on_player1_id"
    t.index ["player2_id"], name: "index_games_on_player2_id"
  end

  create_table "metrics", force: :cascade do |t|
    t.string "name"
    t.decimal "value", precision: 10, scale: 2
    t.string "unit"
    t.datetime "period_start"
    t.datetime "period_end"
    t.decimal "change_percentage", precision: 5, scale: 2
    t.integer "organization_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_metrics_on_organization_id"
  end

  create_table "organization_memberships", force: :cascade do |t|
    t.integer "organization_id", null: false
    t.integer "user_id", null: false
    t.string "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_organization_memberships_on_organization_id"
    t.index ["user_id"], name: "index_organization_memberships_on_user_id"
  end

  create_table "organizations", force: :cascade do |t|
    t.string "name"
    t.decimal "monthly_recurring_revenue", precision: 10, scale: 2
    t.decimal "annual_recurring_revenue", precision: 10, scale: 2
    t.decimal "lifetime_value", precision: 10, scale: 2
    t.decimal "churn_rate", precision: 5, scale: 4
    t.integer "subscription_length_months"
    t.string "billing_contact_email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "subscriptions", force: :cascade do |t|
    t.integer "organization_id", null: false
    t.date "start_date"
    t.date "end_date"
    t.string "subscription_tier"
    t.decimal "subscription_value", precision: 10, scale: 2
    t.string "billing_cycle"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_subscriptions_on_organization_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.date "due_date"
    t.string "status", default: "pending"
    t.integer "deal_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["deal_id"], name: "index_tasks_on_deal_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.boolean "is_active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "organization_id", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["organization_id"], name: "index_users_on_organization_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "contact_deals", "contacts"
  add_foreign_key "contact_deals", "deals"
  add_foreign_key "contacts", "organizations"
  add_foreign_key "deals", "organizations"
  add_foreign_key "deals", "users", column: "owner_id"
  add_foreign_key "games", "users", column: "player1_id"
  add_foreign_key "games", "users", column: "player2_id"
  add_foreign_key "metrics", "organizations"
  add_foreign_key "organization_memberships", "organizations"
  add_foreign_key "organization_memberships", "users"
  add_foreign_key "subscriptions", "organizations"
  add_foreign_key "tasks", "deals"
  add_foreign_key "users", "organizations"
end
