CREATE TABLE users (id UUID PRIMARY KEY, display_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE incidents (id UUID PRIMARY KEY, type TEXT NOT NULL, description TEXT NOT NULL, severity TEXT NOT NULL, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL, created_by UUID NOT NULL REFERENCES users(id));
CREATE TABLE responders (id UUID PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE incident_reports (id UUID PRIMARY KEY, incident_id UUID NOT NULL REFERENCES incidents(id), reporter_id UUID NOT NULL REFERENCES users(id), received_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE assistance_records (id UUID PRIMARY KEY, incident_id UUID NOT NULL REFERENCES incidents(id), responder_id UUID NOT NULL REFERENCES responders(id), notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE payments (id UUID PRIMARY KEY, incident_id UUID REFERENCES incidents(id), provider TEXT NOT NULL, transaction_id TEXT, status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
