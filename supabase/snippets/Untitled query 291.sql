CREATE OR REPLACE FUNCTION owned_store_ids()
RETURNS SETOF uuid AS $$
  SELECT store_id 
  FROM store_members 
  WHERE user_id = auth.uid() AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER;