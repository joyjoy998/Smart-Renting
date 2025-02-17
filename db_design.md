# design considerations

> 如果项目数据主要是结构化的，并且需要支持复杂的关系查询、事务管理和数据完整性，建议采用关系型数据库（例如 PostgreSQL），并利用 JSONB 来存储少量非结构化数据。这也是 Supabase（你们目前项目中用到的后端服务）常用的方案。

> 如果项目的数据结构非常灵活、变化频繁且对水平扩展有更高要求，且数据查询需求较简单，那么可以考虑非关系型数据库（比如 MongoDB）。不过，对于 smart renting 这样一个包含房源、用户、POI 等具有较为固定字段和复杂关系的数据项目来说，关系型数据库通常更适合。

> 所以，综合考虑 smart renting 项目的需求，通常不需要专门使用 MongoDB 这类非关系型数据库；使用关系型数据库（如 PostgreSQL）并结合 JSONB 字段，既能满足数据灵活存储的需要，又能利用 SQL 的强大查询和数据约束能力。


**关于使用 Postgres JSONB 数据类型的问题**
问题描述：
你提到项目中多个地方可能会使用 JSONB 数据，并担心如果只使用 Postgres（比如通过 Supabase）会不会导致查询非常复杂，是否需要结合 MongoDB 一起做项目。

解答建议：
1. Postgres 的 JSONB 功能
* Postgres 的 JSONB 数据类型非常强大，支持灵活存储非结构化数据，同时也能使用索引（比如 GIN 索引）来提高查询性能。
* 对于结构不固定或未来可能扩展的字段（例如 notes 字段或其他一些灵活配置），使用 JSONB 是一种非常合适的选择。

2. 查询复杂性问题
* 虽然 JSONB 查询语法相比传统 SQL 查询会稍微复杂一些，但对于大多数中小型项目来说，并不会构成太大问题。
* 只要设计合理（比如尽量把经常查询的核心数据作为独立列存储，而将可选或扩展信息存入 JSONB），查询的复杂性和性能都是可控的。

3. 是否需要结合 MongoDB
* 如果项目整体数据量不大，而且大部分数据依然具有结构性，那么单纯使用 Postgres 就能满足需求。
* 引入 MongoDB 会增加系统的复杂性（需要同步数据、维护两种数据库等），对于一个毕业设计项目来说通常没有必要。
* 除非你有特别的非结构化数据存储需求或者希望展示混合数据库技术的能力，否则建议保持架构简单，使用 Postgres（例如 Supabase 提供的服务）即可。

总结：
对于你目前的项目，使用 Postgres 完全足够，而且 JSONB 数据类型可以满足灵活存储的需求，不会显著增加查询复杂性。没有必要同时引入 MongoDB，除非你预期未来会有大量非结构化数据存储需求。



# tables 
## users: to store user account info 
根据 RFC 标准，一个完整的电子邮件地址最长为 254 个字符（包括 @ 符号等），通常使用 VARCHAR(255) 是一个常见且安全的选择，大部分项目和实际数据库设计中也普遍采用 VARCHAR(255) 来存储邮箱。

```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,       -- clerk传入
    username VARCHAR(20) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## preferences: to store user preference
### 方案一：一行存放四个 preference
* 每个用户对应一行记录，包含所有四个 preference。
* 查询简单，更新时一次修改全部字段。
* 缺点在于扩展性较低，如果未来需要增加更多 preference 类型或附加信息，就不太灵活。
```sql
CREATE TABLE user_preferences (
    user_id VARCHAR(50) PRIMARY KEY,  -- 与 users 表关联
    distance NUMERIC(3,2) NOT NULL CHECK (distance >= 0 AND distance <= 1),
    price NUMERIC(3,2) NOT NULL CHECK (price >= 0 AND price <= 1),
    amenity NUMERIC(3,2) NOT NULL CHECK (amenity >= 0 AND amenity <= 1),
    neighborhood_safety NUMERIC(3,2) NOT NULL CHECK (neighborhood_safety >= 0 AND neighborhood_safety <= 1),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
```
### 方案二：规范化设计，每个 preference 独立一行
* 每个用户将有 4 条记录，分别对应四个 preference 选项。
* 可通过 weight 计算相对重要性，也可直接设置 preference_order 来明确排序。
* 查询时可以对单个 preference 进行筛选、排序、聚合等操作；扩展性更好，未来增加新 preference 类型也更方便。
```sql
CREATE TABLE user_preferences (
    user_id VARCHAR(50) NOT NULL,
    preference_type VARCHAR(50) NOT NULL,  -- 可限制为 'distance', 'price', 'amenity', 'neighborhood_safety'
    weight NUMERIC(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    preference_order SMALLINT,             -- 可选，用于显式记录排序顺序（例如 1 表示最重要）
    PRIMARY KEY (user_id, preference_type),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
```

## properties：to store property information
这里将解析后的 address 对象拆分成了 street、suburb、state 和 postcode 四个字段，便于后续查询或索引。
photo 和 property_type 均采用数组数据类型。
```sql
CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    suburb VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION,               -- 使用 double precision 存储高精度经纬度
    longitude DOUBLE PRECISION,
    weekly_rent NUMERIC(10,2),
    photo TEXT[] DEFAULT '{}',              -- 图片数组
    bedrooms INT,
    bathrooms INT,
    parking_spaces INT,
    property_type TEXT[],         -- 房屋类型数组
    safety_score NUMERIC(3,2) DEFAULT 0
      CHECK (safety_score >= 0 AND safety_score <= 5),  -- 限制 0-5 分
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


## poi_markers: to store POI information
```sql
CREATE TABLE poi_markers (
    poi_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(50),   -- 如 'restaurant', 'school'（或用户自定义？）
    street VARCHAR(255) NOT NULL,
    suburb VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo TEXT[] DEFAULT '{}'          -- 新增图片数组列
);
```

## saved_groups: to store user's single preference combination
比如我们之前说一个人可能考虑在悉尼or卧龙岗租房，偏好不一样，就存成两组
```sql
CREATE TABLE saved_groups (
    group_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    group_name VARCHAR(100) NOT NULL UNIQUE,  -- 全局唯一，如果用户没有输入名称，系统自动assgin一个随机名称
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_groups_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
```

## saved_pois: to store pois in each saved group
```sql
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
```

## saved_properties: to store properties in each saved group
```sql
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
```
