-- ========== 1. users 表 ==========
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,       -- clerk传入
    username VARCHAR(20) NOT NULL,         -- 这里保留长度限制，视业务需求而定
    email VARCHAR(255) NOT NULL UNIQUE,    -- 通常保留 255 长度限制以满足 RFC 标准
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 2. user_preferences 表 ==========
CREATE TABLE user_preferences (
    user_id VARCHAR(50) NOT NULL,
    preference_type VARCHAR(50) NOT NULL
      CHECK (preference_type IN ('distance', 'price', 'amenity', 'neighborhood_safety')),
    weight NUMERIC(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),  -- 限制 0-1 
    preference_order SMALLINT,
    PRIMARY KEY (user_id, preference_type),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ========== 3. properties 表 ==========
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
    property_type TEXT,  -- 单一类型字段，改为 TEXT 存储
    safety_score NUMERIC(3,2) NOT NULL CHECK (safety_score >= 0 AND safety_score <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 4. poi_markers 表 ==========
CREATE TABLE poi_markers (
    poi_id SERIAL PRIMARY KEY,
    name TEXT,
    category TEXT,         -- 改为 TEXT，允许更灵活输入
    street TEXT NOT NULL,
    suburb TEXT NOT NULL,
    state TEXT NOT NULL
      CHECK (state IN ('NSW', 'VIC', 'ACT', 'NT', 'WA', 'SA', 'QLD', 'TAS')),
    postcode TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo TEXT[] DEFAULT '{}'
);

-- ========== 5. saved_groups 表 ==========
CREATE TABLE saved_groups (
    group_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    group_name TEXT NOT NULL UNIQUE,  -- 改为 TEXT，如果不想限制长度
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_groups_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ========== 6. saved_pois 表 ==========
CREATE TABLE saved_pois (
    group_id INT NOT NULL,
    poi_id INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, poi_id),
    CONSTRAINT fk_saved_pois_group FOREIGN KEY (group_id)
        REFERENCES saved_groups(group_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_saved_pois_poi FOREIGN KEY (poi_id)
        REFERENCES poi_markers(poi_id)
        ON DELETE CASCADE
);

-- ========== 7. saved_properties 表 ==========
CREATE TABLE saved_properties (
    group_id INT NOT NULL,
    property_id INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, property_id),
    CONSTRAINT fk_saved_properties_group FOREIGN KEY (group_id)
        REFERENCES saved_groups(group_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_saved_properties_property FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);
