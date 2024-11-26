# This file contains seed data for products and brands in the beauty industry.
# The data can be loaded with the bin/rails db:seed command.

# Reset all tables
OrganizationMembership.destroy_all
Deal.destroy_all
Contact.destroy_all
Metric.destroy_all
User.destroy_all
Organization.destroy_all

# Create organizations
org = Organization.create!(
  name: "Acme Corporation"
)

# Create users
user = User.create!(
  email: "demo@imderek.com", 
  password: "demo", 
  organization_id: org.id 
)

# Create organization memberships
OrganizationMembership.create!([
  { organization_id: org.id, user_id: user.id, role: "admin" }
])

# Create deals
Deal.create!([
  { 
    name: "Acme Corporation", 
    description: "Enterprise deal for 500 seats. Decision maker is CTO Sarah Smith. Currently using competitor product but contract expires in 3 months. Initial discussions indicate strong interest.", 
    status: "negotiating", 
    amount: 100000,
    organization_id: org.id,
    close_date: 2.months.from_now,
    owner_id: user.id
  },
  { 
    name: "TechStart Inc.", 
    description: "Growing startup needing scalable solution. 50 seats to start with potential growth to 200 within 12 months. Main contact is CEO John Davis. Company experiencing rapid growth.", 
    status: "discovery", 
    amount: 90000,
    organization_id: org.id,
    close_date: 4.months.from_now,
    owner_id: user.id
  },
  { 
    name: "Global Logistics Ltd", 
    description: "International shipping company looking to modernize operations. 1000+ potential seats. In late stages of procurement process. Multiple stakeholders across regions have validated fit.", 
    status: "closing", 
    amount: 65000,
    organization_id: org.id,
    close_date: 2.weeks.from_now,
    owner_id: user.id
  },
  { 
    name: "First National Bank", 
    description: "Financial institution requiring enterprise security features. POC completed successfully. Security team has approved compliance requirements. Integration testing showed excellent results.", 
    status: "negotiating", 
    amount: 200000,
    organization_id: org.id,
    close_date: 1.month.from_now,
    owner_id: user.id
  },
  { 
    name: "Innovate Solutions LLC", 
    description: "Mid-size consulting firm. 200 seat opportunity. Requires custom integration with existing systems. Initial technical assessment shows moderate complexity.", 
    status: "discovery", 
    amount: 225000,
    organization_id: org.id,
    close_date: 6.months.from_now,
    owner_id: user.id
  }
])

# Create contacts
Contact.create!([
  {
    first_name: "Sarah",
    last_name: "Smith",
    email: "sarah.smith@acmecorp.com",
    phone: "+1 (415) 555-0123",
    primary: true,
    organization_id: org.id
  },
  {
    first_name: "John",
    last_name: "Davis", 
    email: "john.davis@techstart.io",
    phone: "+1 (415) 555-0124",
    primary: true,
    organization_id: org.id
  },
  {
    first_name: "Michael",
    last_name: "Chen",
    email: "mchen@globallogistics.com",
    phone: "+1 (415) 555-0125",
    primary: true,
    organization_id: org.id
  },
  {
    first_name: "Patricia",
    last_name: "Rodriguez",
    email: "prodriguez@fnb.com",
    phone: "+1 (415) 555-0126",
    primary: true,
    organization_id: org.id
  },
  {
    first_name: "James",
    last_name: "Wilson",
    email: "jwilson@innovatesolutions.com",
    phone: "+1 (415) 555-0127",
    primary: true,
    organization_id: org.id
  },
  {
    first_name: "Emily",
    last_name: "Taylor",
    email: "etaylor@techstart.io",
    phone: "+1 (415) 555-0128",
    organization_id: org.id
  },
  {
    first_name: "Robert",
    last_name: "Martinez",
    email: "rmartinez@globallogistics.com",
    phone: "+1 (415) 555-0129",
    organization_id: org.id
  },
  {
    first_name: "Lisa",
    last_name: "Anderson",
    email: "landerson@fnb.com",
    phone: "+1 (415) 555-0130",
    organization_id: org.id
  }
])

# Create contact deals
ContactDeal.create!([
  { contact_id: Contact.first.id, deal_id: Deal.first.id, primary: true },
  { contact_id: Contact.second.id, deal_id: Deal.first.id, primary: false },
  { contact_id: Contact.third.id, deal_id: Deal.second.id, primary: true },
  { contact_id: Contact.fourth.id, deal_id: Deal.second.id, primary: false },
  { contact_id: Contact.fifth.id, deal_id: Deal.second.id, primary: false },
  { contact_id: Contact.last.id, deal_id: Deal.third.id, primary: true },
  { contact_id: Contact.first.id, deal_id: Deal.fourth.id, primary: true },
  { contact_id: Contact.second.id, deal_id: Deal.fourth.id, primary: false },
  { contact_id: Contact.third.id, deal_id: Deal.fourth.id, primary: false },
  { contact_id: Contact.first.id, deal_id: Deal.fifth.id, primary: true },
  { contact_id: Contact.second.id, deal_id: Deal.fifth.id, primary: false },
  { contact_id: Contact.third.id, deal_id: Deal.fifth.id, primary: false }
])

# Create metrics for a week of total sales
7.times do |i|
  Metric.create!(
    name: "Total Sales",
    value: rand(20000..50000), # Random value for demonstration
    unit: "currency",
    period_start: i.days.ago.beginning_of_day,
    period_end: i.days.ago.end_of_day,
    change_percentage: rand(-20..20), # Random percentage change between -20% and +20%
    organization_id: org.id
  )
end

# Create metrics for a week of win rate
7.times do |i|
  Metric.create!(
    name: "Win Rate",
    value: rand(20..60), # Random percentage between 20-60%
    unit: "percentage", 
    period_start: i.days.ago.beginning_of_day,
    period_end: i.days.ago.end_of_day,
    change_percentage: rand(-15..15), # Random percentage change between -15% and +15%
    organization_id: org.id
  )
end

# Create metrics for a week of conversion rate
7.times do |i|
  Metric.create!(
    name: "Conversion Rate",
    value: rand(10..40), # Random percentage between 10-40%
    unit: "percentage",
    period_start: i.days.ago.beginning_of_day,
    period_end: i.days.ago.end_of_day,
    change_percentage: rand(-10..10), # Random percentage change between -10% and +10%
    organization_id: org.id
  )
end

# Create metrics for a week of pipeline value
7.times do |i|
  Metric.create!(
    name: "Pipeline Value",
    value: rand(100000..300000), # Random value between 100k-300k
    unit: "currency",
    period_start: i.days.ago.beginning_of_day,
    period_end: i.days.ago.end_of_day,
    change_percentage: rand(-25..25), # Random percentage change between -25% and +25%
    organization_id: org.id
  )
end


# Add tasks to deals
Deal.all.each do |deal|
  rand(2..5).times do
    deal.tasks.create!(
      title: Faker::Company.bs.titleize,
      description: "#{Faker::Verb.base.titleize} #{Faker::Company.buzzword} #{Faker::Company.catch_phrase}",
      due_date: rand(10..30).days.from_now,
      status: ['pending', 'in_progress', 'completed'].sample
    )
  end
end

puts "DB seeding complete!"
