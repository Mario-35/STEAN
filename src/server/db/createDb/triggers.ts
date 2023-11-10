/**
 * triggers for createDB.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */

export const triggers = [
  `CREATE OR REPLACE FUNCTION func_trigger_after_insert_or_update_thing_location()
  RETURNS trigger AS
    $$
    DECLARE t_id integer;    
    BEGIN
      INSERT INTO historical_location(time, thing_id) VALUES(current_timestamp, new.thing_id) returning id into t_id;
      INSERT INTO location_historical_location(historical_location_id, location_id) VALUES(t_id, new.location_id);
      RETURN NEW;
    END;
    $$ LANGUAGE 'plpgsql';`,

  `CREATE TRIGGER trigger_after_insert_thing_location AFTER INSERT OR UPDATE ON thing_location FOR EACH ROW EXECUTE PROCEDURE func_trigger_after_insert_or_update_thing_location();`,
  `CREATE OR REPLACE FUNCTION func_trigger_after_update_observation()
  RETURNS trigger AS
    $$
    DECLARE t_id integer;    
    BEGIN
      INSERT INTO historical_observation("validTime", "_result", "observation_id") values (OLD."validTime", OLD."result", OLD."id") returning id into t_id;
      RETURN NEW;
    END;
    $$ LANGUAGE 'plpgsql';`,

  `CREATE TRIGGER trigger_after_update_observation_result AFTER update ON observation FOR EACH ROW EXECUTE PROCEDURE func_trigger_after_update_observation();`,

  `CREATE OR REPLACE FUNCTION timestamp_ceil(_tstz timestamptz, _int_seconds int)
    RETURNS timestamptz AS
    $func$   
      SELECT to_timestamp(ceil(extract(epoch FROM $1) / $2) * $2)
    $func$  LANGUAGE sql STABLE;`,

  `CREATE OR REPLACE FUNCTION timestamp_ceil(_tstz timestamptz, _interval interval)
    RETURNS timestamptz LANGUAGE sql STABLE AS
  'SELECT timestamp_ceil($1, extract(epoch FROM $2)::int)';`,

  `CREATE OR REPLACE FUNCTION row_estimator(query text) RETURNS bigint
    LANGUAGE plpgsql AS
  $$DECLARE
    plan jsonb;
  BEGIN
    EXECUTE 'EXPLAIN (FORMAT JSON) ' || query INTO plan;  
    RETURN (plan->0->'Plan'->>'Plan Rows')::bigint;
  END;$$;`,
];
