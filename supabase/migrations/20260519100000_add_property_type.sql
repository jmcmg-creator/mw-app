-- Real-estate property type.
create type "PropertyType" as enum (
  'APPARTEMENT_LCD',
  'APPARTEMENT_BAIL_MOBILITE',
  'BUREAUX',
  'LOCAL_COMMERCIAL',
  'HOTEL',
  'MAISON'
);

alter table "assets" add column if not exists "property_type" "PropertyType";
