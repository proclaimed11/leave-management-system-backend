INSERT INTO company_holidays (
  holiday_date,
  name,
  holiday_type,
  company_key,
  location,
  is_recurring,
  created_by
)
VALUES
-- Fixed Recurring Holidays
('2026-01-01', 'New Year''s Day', 'PUBLIC', NULL, NULL, TRUE, 'SYSTEM'),
('2026-05-01', 'Labour Day', 'PUBLIC', NULL, NULL, TRUE, 'SYSTEM'),
('2026-06-01', 'Madaraka Day', 'PUBLIC', NULL, NULL, TRUE, 'SYSTEM'),
('2026-10-10', 'Mazingira Day', 'PUBLIC', NULL, NULL, TRUE, 'SYSTEM'),
('2026-10-20', 'Mashujaa Day', 'PUBLIC', NULL, NULL, TRUE, 'SYSTEM'),
('2026-12-12', 'Jamhuri Day', 'PUBLIC', NULL, NULL, TRUE, 'SYSTEM'),
('2026-12-25', 'Christmas Day', 'PUBLIC', NULL, NULL, TRUE, 'SYSTEM'),
('2026-12-26', 'Boxing Day', 'PUBLIC', NULL, NULL, TRUE, 'SYSTEM'),

-- Movable Holidays (NOT recurring)
('2026-04-03', 'Good Friday', 'PUBLIC', NULL, NULL, FALSE, 'SYSTEM'),
('2026-04-06', 'Easter Monday', 'PUBLIC', NULL, NULL, FALSE, 'SYSTEM')

ON CONFLICT DO NOTHING;
