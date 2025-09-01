-- Legal and Licensing System Migration
-- This migration creates tables for flexible licensing, legal documents, GDPR compliance, and copyright protection

-- License Types Table
CREATE TABLE license_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  terms TEXT NOT NULL,
  commercial_use BOOLEAN DEFAULT FALSE,
  modification_allowed BOOLEAN DEFAULT FALSE,
  redistribution_allowed BOOLEAN DEFAULT FALSE,
  attribution_required BOOLEAN DEFAULT TRUE,
  price_modifier DECIMAL DEFAULT 1.0, -- Multiplier for base price
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Licenses Table
CREATE TABLE product_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  license_type_id UUID REFERENCES license_types(id),
  custom_terms TEXT,
  price DECIMAL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Legal Documents Table
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id) NULL,
  document_type VARCHAR NOT NULL, -- 'terms_of_service', 'privacy_policy', 'license_agreement', 'copyright_notice'
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  template_id UUID NULL,
  variables JSONB, -- For dynamic content replacement
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Legal Document Templates Table
CREATE TABLE legal_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  document_type VARCHAR NOT NULL,
  content TEXT NOT NULL,
  variables JSONB, -- Available variables for replacement
  jurisdiction VARCHAR DEFAULT 'US',
  language VARCHAR DEFAULT 'en',
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- GDPR Compliance Table
CREATE TABLE gdpr_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP NULL,
  data_processing_purposes JSONB,
  marketing_consent BOOLEAN DEFAULT FALSE,
  analytics_consent BOOLEAN DEFAULT FALSE,
  third_party_sharing_consent BOOLEAN DEFAULT FALSE,
  withdrawal_date TIMESTAMP NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Data Processing Activities Table
CREATE TABLE data_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR NOT NULL, -- 'collection', 'processing', 'storage', 'sharing', 'deletion'
  data_category VARCHAR NOT NULL, -- 'personal', 'sensitive', 'behavioral', 'technical'
  purpose VARCHAR NOT NULL,
  legal_basis VARCHAR NOT NULL, -- 'consent', 'contract', 'legal_obligation', 'legitimate_interest'
  retention_period INTEGER, -- Days
  third_parties JSONB, -- List of third parties data is shared with
  security_measures JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Copyright Protection Table
CREATE TABLE copyright_protections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id),
  copyright_notice TEXT NOT NULL,
  registration_number VARCHAR NULL,
  registration_date DATE NULL,
  protection_level VARCHAR DEFAULT 'basic', -- 'basic', 'standard', 'premium'
  dmca_agent_info JSONB,
  watermark_settings JSONB,
  monitoring_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Copyright Violations Table
CREATE TABLE copyright_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copyright_id UUID REFERENCES copyright_protections(id),
  reported_by UUID REFERENCES users(id),
  violation_url VARCHAR,
  violation_type VARCHAR NOT NULL, -- 'unauthorized_use', 'plagiarism', 'redistribution'
  description TEXT,
  evidence JSONB, -- Screenshots, links, etc.
  status VARCHAR DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed'
  resolution TEXT NULL,
  resolved_by UUID REFERENCES users(id) NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dispute Resolution Table
CREATE TABLE dispute_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR UNIQUE NOT NULL,
  complainant_id UUID REFERENCES users(id),
  respondent_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id) NULL,
  dispute_type VARCHAR NOT NULL, -- 'copyright', 'licensing', 'contract', 'refund'
  description TEXT NOT NULL,
  evidence JSONB,
  status VARCHAR DEFAULT 'open', -- 'open', 'mediation', 'arbitration', 'resolved', 'closed'
  mediator_id UUID REFERENCES users(id) NULL,
  resolution TEXT NULL,
  resolution_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Legal Compliance Audits Table
CREATE TABLE legal_compliance_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  audit_type VARCHAR NOT NULL, -- 'gdpr', 'copyright', 'licensing', 'terms'
  compliance_score INTEGER, -- 0-100
  findings JSONB,
  recommendations JSONB,
  action_items JSONB,
  status VARCHAR DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  auditor_id UUID REFERENCES users(id) NULL,
  audit_date TIMESTAMP DEFAULT NOW(),
  next_audit_date TIMESTAMP NULL
);

-- White Label Configurations Table
CREATE TABLE white_label_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  domain VARCHAR UNIQUE,
  branding JSONB, -- Logo, colors, fonts, etc.
  custom_terms JSONB,
  revenue_share_percentage DECIMAL DEFAULT 0.20, -- 20% to white label client
  features_enabled JSONB,
  custom_css TEXT,
  custom_js TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default license types
INSERT INTO license_types (name, description, terms, commercial_use, modification_allowed, redistribution_allowed, attribution_required, price_modifier) VALUES
('Personal Use Only', 'For personal, non-commercial use only', 'This license grants you the right to use this product for personal purposes only. Commercial use is strictly prohibited.', FALSE, FALSE, FALSE, TRUE, 1.0),
('Commercial License', 'Full commercial rights with modifications allowed', 'This license grants you full commercial rights to use, modify, and distribute this product.', TRUE, TRUE, TRUE, TRUE, 2.5),
('Extended Commercial', 'Commercial use with resale rights', 'This license includes all commercial rights plus the ability to resell the product as part of your own offerings.', TRUE, TRUE, TRUE, TRUE, 5.0),
('Exclusive License', 'Exclusive rights with full ownership transfer', 'This license transfers exclusive rights to you, including the ability to claim authorship and prevent others from using the product.', TRUE, TRUE, TRUE, FALSE, 10.0),
('Creative Commons', 'Open source with attribution', 'This product is licensed under Creative Commons, allowing free use with proper attribution.', TRUE, TRUE, TRUE, TRUE, 0.0);

-- Insert default legal document templates
INSERT INTO legal_document_templates (name, document_type, content, variables, jurisdiction) VALUES
('Standard Terms of Service', 'terms_of_service', 
'TERMS OF SERVICE

Last updated: {{date}}

1. ACCEPTANCE OF TERMS
By accessing and using {{platform_name}}, you accept and agree to be bound by the terms and provision of this agreement.

2. USE LICENSE
Permission is granted to temporarily download one copy of {{platform_name}} for personal, non-commercial transitory viewing only.

3. DISCLAIMER
The materials on {{platform_name}} are provided on an "as is" basis. {{company_name}} makes no warranties, expressed or implied.

4. LIMITATIONS
In no event shall {{company_name}} be liable for any damages arising out of the use or inability to use the materials on {{platform_name}}.

5. ACCURACY OF MATERIALS
The materials appearing on {{platform_name}} could include technical, typographical, or photographic errors.

6. LINKS
{{company_name}} has not reviewed all of the sites linked to our platform and is not responsible for the contents of any such linked site.

7. MODIFICATIONS
{{company_name}} may revise these terms of service at any time without notice.

8. GOVERNING LAW
These terms and conditions are governed by and construed in accordance with the laws of {{jurisdiction}}.', 
'{"date": "Current date", "platform_name": "Platform name", "company_name": "Company name", "jurisdiction": "Legal jurisdiction"}', 'US'),

('GDPR Privacy Policy', 'privacy_policy',
'PRIVACY POLICY

Last updated: {{date}}

1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to provide, maintain, and improve our services.

3. SHARING OF INFORMATION
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.

4. YOUR RIGHTS (GDPR)
If you are a resident of the European Union, you have certain rights regarding your personal data:
- Right to access your data
- Right to rectification
- Right to erasure
- Right to restrict processing
- Right to data portability
- Right to object

5. DATA RETENTION
We retain your information for as long as necessary to provide our services and comply with legal obligations.

6. SECURITY
We implement appropriate security measures to protect your personal information.

7. CONTACT US
If you have questions about this Privacy Policy, please contact us at {{contact_email}}.', 
'{"date": "Current date", "contact_email": "Contact email address"}', 'EU');

-- Create indexes for better performance
CREATE INDEX idx_product_licenses_product_id ON product_licenses(product_id);
CREATE INDEX idx_legal_documents_user_id ON legal_documents(user_id);
CREATE INDEX idx_legal_documents_type ON legal_documents(document_type);
CREATE INDEX idx_gdpr_compliance_user_id ON gdpr_compliance(user_id);
CREATE INDEX idx_copyright_protections_product_id ON copyright_protections(product_id);
CREATE INDEX idx_copyright_violations_copyright_id ON copyright_violations(copyright_id);
CREATE INDEX idx_dispute_resolutions_status ON dispute_resolutions(status);
CREATE INDEX idx_white_label_configs_domain ON white_label_configs(domain);

-- Enable RLS (Row Level Security)
ALTER TABLE license_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_protections ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- License types are public
CREATE POLICY "License types are viewable by everyone" ON license_types FOR SELECT USING (true);

-- Product licenses are viewable by product owner and buyers
CREATE POLICY "Product licenses viewable by owner" ON product_licenses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products p 
    WHERE p.id = product_licenses.product_id 
    AND p.user_id = auth.uid()
  )
);

-- Legal documents are private to user
CREATE POLICY "Legal documents are private" ON legal_documents FOR ALL USING (user_id = auth.uid());

-- Legal document templates are public for basic ones, premium for subscribers
CREATE POLICY "Legal templates access" ON legal_document_templates FOR SELECT USING (
  NOT is_premium OR 
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.subscription_tier IN ('pro', 'enterprise')
  )
);

-- GDPR compliance is private to user
CREATE POLICY "GDPR compliance is private" ON gdpr_compliance FOR ALL USING (user_id = auth.uid());

-- Data processing activities are private to user
CREATE POLICY "Data processing activities are private" ON data_processing_activities FOR ALL USING (user_id = auth.uid());

-- Copyright protections are viewable by owner
CREATE POLICY "Copyright protections viewable by owner" ON copyright_protections FOR ALL USING (owner_id = auth.uid());

-- Copyright violations can be reported by anyone, viewed by owner
CREATE POLICY "Copyright violations reporting" ON copyright_violations FOR INSERT WITH CHECK (true);
CREATE POLICY "Copyright violations viewing" ON copyright_violations FOR SELECT USING (
  reported_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM copyright_protections cp 
    WHERE cp.id = copyright_violations.copyright_id 
    AND cp.owner_id = auth.uid()
  )
);

-- Dispute resolutions are viewable by involved parties
CREATE POLICY "Dispute resolutions access" ON dispute_resolutions FOR ALL USING (
  complainant_id = auth.uid() OR 
  respondent_id = auth.uid() OR 
  mediator_id = auth.uid()
);

-- Legal compliance audits are private to user
CREATE POLICY "Legal audits are private" ON legal_compliance_audits FOR ALL USING (user_id = auth.uid());

-- White label configs are private to client
CREATE POLICY "White label configs are private" ON white_label_configs FOR ALL USING (client_id = auth.uid());