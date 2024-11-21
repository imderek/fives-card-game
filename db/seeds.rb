# This file contains seed data for products and brands in the beauty industry.
# The data can be loaded with the bin/rails db:seed command.

# Reset all tables
OrganizationMembership.destroy_all
Organization.destroy_all
User.destroy_all
Deal.destroy_all

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
    close_date: 2.months.from_now
  },
  { 
    name: "TechStart Inc.", 
    description: "Growing startup needing scalable solution. 50 seats to start with potential growth to 200 within 12 months. Main contact is CEO John Davis. Company experiencing rapid growth.", 
    status: "discovery", 
    amount: 90000,
    organization_id: org.id,
    close_date: 4.months.from_now
  },
  { 
    name: "Global Logistics Ltd", 
    description: "International shipping company looking to modernize operations. 1000+ potential seats. In late stages of procurement process. Multiple stakeholders across regions have validated fit.", 
    status: "closing", 
    amount: 65000,
    organization_id: org.id,
    close_date: 2.weeks.from_now
  },
  { 
    name: "First National Bank", 
    description: "Financial institution requiring enterprise security features. POC completed successfully. Security team has approved compliance requirements. Integration testing showed excellent results.", 
    status: "negotiating", 
    amount: 200000,
    organization_id: org.id,
    close_date: 1.month.from_now
  },
  { 
    name: "Innovate Solutions LLC", 
    description: "Mid-size consulting firm. 200 seat opportunity. Requires custom integration with existing systems. Initial technical assessment shows moderate complexity.", 
    status: "discovery", 
    amount: 225000,
    organization_id: org.id,
    close_date: 6.months.from_now
  }
])

puts "DB seeding complete!"
