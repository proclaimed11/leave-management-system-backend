INSERT INTO leave_rules (
  leave_type_id,
  entitlement_days,
  max_consecutive_days,
  max_per_year,
  requires_approval,
  approval_levels,
  paid,
  deduct_from_balance,
  requires_document,
  attachment_required_after_days,
  allow_weekends,
  allow_public_holidays,
  min_service_months,
  gender_restriction,
  notice_days_required
)
SELECT
  lt.id,
  CASE lt.type_key
    WHEN 'ANNUAL' THEN 21
    WHEN 'SICK' THEN 14
    WHEN 'MATERNITY' THEN 90
    WHEN 'PATERNITY' THEN 14
    WHEN 'COMPASSIONATE' THEN 10
    WHEN 'STUDY' THEN 10
    WHEN 'UNPAID' THEN 0
    WHEN 'COMP_OFF' THEN 0
    ELSE 0
  END AS entitlement_days,
  CASE lt.type_key
    WHEN 'MATERNITY' THEN 98
    ELSE 30
  END AS max_consecutive_days,
  CASE lt.type_key
    WHEN 'MATERNITY' THEN 90
    WHEN 'UNPAID' THEN 365
    WHEN 'COMP_OFF' THEN 30
    ELSE CASE lt.type_key
      WHEN 'ANNUAL' THEN 21
      WHEN 'SICK' THEN 14
      WHEN 'PATERNITY' THEN 14
      WHEN 'COMPASSIONATE' THEN 10
      WHEN 'STUDY' THEN 10
      ELSE 0
    END
  END AS max_per_year,
  TRUE AS requires_approval,
  CASE lt.type_key
    WHEN 'MATERNITY' THEN 1
    ELSE 2
  END AS approval_levels,
  CASE lt.type_key
    WHEN 'UNPAID' THEN FALSE
    ELSE TRUE
  END AS paid,
  CASE lt.type_key
    WHEN 'UNPAID' THEN FALSE
    ELSE TRUE
  END AS deduct_from_balance,
  CASE lt.type_key
    WHEN 'MATERNITY' THEN TRUE
    ELSE FALSE
  END AS requires_document,
  NULL::integer AS attachment_required_after_days,
  FALSE AS allow_weekends,
  FALSE AS allow_public_holidays,
  0 AS min_service_months,
  CASE lt.type_key
    WHEN 'MATERNITY' THEN 'female'
    WHEN 'PATERNITY' THEN 'male'
    ELSE 'any'
  END AS gender_restriction,
  CASE lt.type_key
    WHEN 'ANNUAL' THEN 3
    ELSE 0
  END AS notice_days_required
FROM leave_types lt
WHERE NOT EXISTS (
  SELECT 1
  FROM leave_rules lr
  WHERE lr.leave_type_id = lt.id
);
