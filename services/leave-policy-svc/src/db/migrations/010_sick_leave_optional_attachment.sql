-- Sick leave: do not require a medical certificate by default (apply + approve).
-- Maternity unchanged (still requires_document where set in prior migrations).

UPDATE leave_rules lr
SET
  requires_document = FALSE,
  attachment_required_after_days = NULL
FROM leave_types lt
WHERE lr.leave_type_id = lt.id
  AND lt.type_key = 'SICK';
