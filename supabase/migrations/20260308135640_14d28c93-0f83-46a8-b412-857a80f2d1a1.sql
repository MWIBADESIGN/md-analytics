DELETE FROM pageviews WHERE visitor_id IN ('test_visitor_123', 'test_visitor_456', 'test_geo_check');
DELETE FROM events WHERE visitor_id IN ('test_visitor_123', 'test_visitor_456', 'test_geo_check');
DELETE FROM sessions WHERE visitor_id IN ('test_visitor_123', 'test_visitor_456', 'test_geo_check');