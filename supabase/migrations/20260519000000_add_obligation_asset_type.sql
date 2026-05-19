-- Add the OBLIGATION (bond) value to the AssetType enum.
alter type "AssetType" add value if not exists 'OBLIGATION';
