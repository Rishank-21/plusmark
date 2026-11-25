CREATE SCHEMA zz_shim;
CREATE FUNCTION zz_shim.plan(int) RETURNS text LANGUAGE sql AS $$ SELECT '1..'||$1 $$;
CREATE FUNCTION zz_shim.ok(boolean, text DEFAULT '') RETURNS text LANGUAGE sql AS $$ SELECT CASE WHEN $1 IS TRUE THEN 'ok - ' ELSE 'NOT OK - ' END || $2 $$;
CREATE FUNCTION zz_shim.is(anyelement, anyelement, text DEFAULT '') RETURNS text LANGUAGE sql AS $$ SELECT CASE WHEN $1 IS NOT DISTINCT FROM $2 THEN 'ok - '||$3 ELSE 'NOT OK - '||$3||' got='||coalesce($1::text,'NULL')||' want='||coalesce($2::text,'NULL') END $$;
CREATE FUNCTION zz_shim.matches(text, text, text DEFAULT '') RETURNS text LANGUAGE sql AS $$ SELECT CASE WHEN $1 ~ $2 THEN 'ok - '||$3 ELSE 'NOT OK - '||$3||' got='||$1 END $$;
CREATE FUNCTION zz_shim.finish() RETURNS text LANGUAGE sql AS $$ SELECT 'done' $$;
SET search_path = zz_shim, public, extensions;

