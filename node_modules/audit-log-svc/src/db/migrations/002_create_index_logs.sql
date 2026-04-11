CREATE INDEX idx_event_type ON audit_logs(event_type);
CREATE INDEX idx_actor ON audit_logs(actor_employee_number);
CREATE INDEX idx_target ON audit_logs(target_employee_number);
CREATE INDEX idx_created_at ON audit_logs(created_at);
