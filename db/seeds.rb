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
    description: "Enterprise deal for 500 seats. Decision maker is CTO Sarah Smith. Currently using competitor product but contract expires in 3 months.", 
    status: "negotiating", 
    organization_id: org.id 
  },
  { 
    name: "TechStart Inc.", 
    description: "Growing startup needing scalable solution. 50 seats to start with potential growth to 200 within 12 months. Main contact is CEO John Davis.", 
    status: "discovery", 
    organization_id: org.id 
  },
  { 
    name: "Global Logistics Ltd", 
    description: "International shipping company looking to modernize operations. 1000+ potential seats. In late stages of procurement process.", 
    status: "closing", 
    organization_id: org.id 
  },
  { 
    name: "First National Bank", 
    description: "Financial institution requiring enterprise security features. POC completed successfully, moving to contract negotiations.", 
    status: "negotiating", 
    organization_id: org.id 
  },
  { 
    name: "Innovate Solutions LLC", 
    description: "Mid-size consulting firm. 200 seat opportunity. Requires custom integration with existing systems.", 
    status: "discovery", 
    organization_id: org.id 
  }
])




puts "DB seeding complete!"
