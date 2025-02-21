CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,       -- clerk传入
    username VARCHAR(20) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    suburb VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL
      CHECK (state IN ('NSW', 'VIC', 'ACT', 'NT', 'WA', 'SA', 'QLD', 'TAS')),
    postcode VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    weekly_rent NUMERIC(10,2),
    photo TEXT[] DEFAULT '{}',
    bedrooms INT,
    bathrooms INT,
    parking_spaces INT,
    property_type TEXT[],
    safety_score NUMERIC(3,2) NOT NULL CHECK (safety_score >= 0 AND safety_score <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE poi_markers (
    poi_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(50),   -- 如 'restaurant', 'school'（或用户自定义？）
    street VARCHAR(255) NOT NULL,
    suburb VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL
      CHECK (state IN ('NSW', 'VIC', 'ACT', 'NT', 'WA', 'SA', 'QLD', 'TAS')),
    postcode VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo TEXT[] DEFAULT '{}'          -- 新增图片数组列
);

CREATE TABLE saved_groups (
    group_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    group_name VARCHAR(50) NOT NULL UNIQUE,  -- 全局唯一，如果用户没有输入名称，系统自动assgin一个随机名称
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_groups_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE saved_pois (
    group_id INT NOT NULL,
    poi_id INT NOT NULL,
    note TEXT,  -- 用户对该 POI 的个性化备注
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, poi_id),  -- 复合主键，确保在同一组中同一个 POI 只保存一次
    CONSTRAINT fk_saved_pois_group FOREIGN KEY (group_id)
        REFERENCES saved_groups(group_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_saved_pois_poi FOREIGN KEY (poi_id)
        REFERENCES poi_markers(poi_id)
        ON DELETE CASCADE
);

CREATE TABLE saved_properties (
    group_id INT NOT NULL,
    property_id INT NOT NULL,
    note TEXT,  -- 用户对该房源的个性化备注
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, property_id),  -- 复合主键
    CONSTRAINT fk_saved_properties_group FOREIGN KEY (group_id)
        REFERENCES saved_groups(group_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_saved_properties_property FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);