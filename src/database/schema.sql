-- =====================================================
-- 1. user account related tables
-- =====================================================

CREATE TABLE users (
    user_id text PRIMARY KEY,       -- 来自 Clerk 的用户ID
    username VARCHAR(20) NOT NULL,         
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
    user_id text NOT NULL,
    preference_type VARCHAR(50) NOT NULL
      CHECK (preference_type IN ('distance', 'price', 'amenity', 'neighborhood_safety')),
    weight NUMERIC(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1), 
    preference_order SMALLINT,
    PRIMARY KEY (user_id, preference_type),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =====================================================
-- 2. public data tables (properties and POI inserted by admin)
-- =====================================================

CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    street TEXT NOT NULL,
    suburb TEXT NOT NULL,
    state TEXT NOT NULL
      CHECK (state IN ('NSW', 'VIC', 'ACT', 'NT', 'WA', 'SA', 'QLD', 'TAS')),
    postcode TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    weekly_rent NUMERIC(10,2),
    photo TEXT[] DEFAULT '{}',
    bedrooms INT,
    bathrooms INT,
    parking_spaces INT,
    property_type TEXT,  -- each property has only one type
    safety_score NUMERIC(3,2) NOT NULL CHECK (safety_score >= 0 AND safety_score <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE poi_markers (
    poi_id SERIAL PRIMARY KEY,
    name TEXT,
    category TEXT,
    street TEXT NOT NULL,
    suburb TEXT NOT NULL,
    state TEXT NOT NULL
      CHECK (state IN ('NSW', 'VIC', 'ACT', 'NT', 'WA', 'SA', 'QLD', 'TAS')),
    postcode TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo TEXT[] DEFAULT '{}'
);

-- =====================================================
-- 3. user saved data tables
-- =====================================================

CREATE TABLE saved_groups (
    group_id SERIAL PRIMARY KEY,
    user_id text NOT NULL,
    group_name TEXT NOT NULL UNIQUE,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_groups_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- user saved properties (detailed info stored in this table)
CREATE TABLE saved_properties (
    saved_property_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    property_id INT,  -- optional, link to public property data; if null, user input all info
    street TEXT NOT NULL,
    suburb TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('NSW', 'VIC', 'ACT', 'NT', 'WA', 'SA', 'QLD', 'TAS')),
    postcode TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    weekly_rent NUMERIC(10,2),
    photo TEXT[] DEFAULT '{}',
    bedrooms INT,
    bathrooms INT,
    parking_spaces INT,
    property_type TEXT,
    safety_score NUMERIC(3,2) NOT NULL CHECK (safety_score >= 0 AND safety_score <= 1),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_properties_group FOREIGN KEY (group_id)
        REFERENCES saved_groups(group_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_saved_properties_property FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);

-- user saved POIs (detailed info stored in this table)
CREATE TABLE saved_pois (
    saved_poi_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    poi_id INT,  -- optional, link to public POI data; if null, user input all info
    name TEXT,
    category TEXT,
    street TEXT NOT NULL,
    suburb TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('NSW', 'VIC', 'ACT', 'NT', 'WA', 'SA', 'QLD', 'TAS')),
    postcode TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo TEXT[] DEFAULT '{}',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_pois_group FOREIGN KEY (group_id)
        REFERENCES saved_groups(group_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_saved_pois_poi FOREIGN KEY (poi_id)
        REFERENCES poi_markers(poi_id)
        ON DELETE CASCADE
);

-- =====================================================
-- 4. crime data table
-- =====================================================

CREATE TABLE crime_data (
    suburb TEXT,
    crime_count INT,
    safety_score NUMERIC(3,2)
);

-- =====================================================
-- 5. triggers: set safety score for saved properties
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_saved_properties_safety_score()
RETURNS TRIGGER AS $$
DECLARE
  cs NUMERIC(3,2);
BEGIN
  SELECT safety_score INTO cs
  FROM crime_data_total
  WHERE lower(suburb) = lower(NEW.suburb)
  LIMIT 1;
  
  IF cs IS NOT NULL THEN
    NEW.safety_score := cs;
  ELSE
    NEW.safety_score := 0.88;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, pg_catalog;

CREATE TRIGGER before_insert_saved_properties_safety_score
BEFORE INSERT ON saved_properties
FOR EACH ROW
EXECUTE FUNCTION set_saved_properties_safety_score();



-- =====================================================
-- 6. create property vector table
-- =====================================================
CREATE TABLE property_vectors (
    property_id INT PRIMARY KEY REFERENCES properties(property_id) ON DELETE CASCADE,
    embedding vector(1024)
);

