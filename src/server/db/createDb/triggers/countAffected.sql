/* function countAffected */
CREATE OR REPLACE FUNCTION countAffected() 
RETURNS integer AS $$
DECLARE
    x integer := -1;
BEGIN
    GET DIAGNOSTICS x = ROW_COUNT;
    RETURN x;
END;
$$ LANGUAGE plpgsql;