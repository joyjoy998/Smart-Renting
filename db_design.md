# Choosing the Right Database

> If the project data is mainly structured and requires complex relational queries, transaction management, and data integrity, a relational database (e.g., PostgreSQL) is recommended. Supabase, which you are using, is built on PostgreSQL.
>
>If the data structure is highly flexible, changes frequently, and requires horizontal scaling while having simple query needs, then a NoSQL database (e.g., MongoDB) could be considered.
>
> For Smart Renting, a project involving properties, users, and POIs (Points of Interest) with well-defined attributes and complex relationships, a relational database (PostgreSQL) with JSONB support is the best choice.


**Using JSONB in PostgreSQL**

Q: Should we combine PostgreSQL with MongoDB for more flexibility?

A: No, PostgreSQL's JSONB data type is powerful enough for semi-structured data storage.

* JSONB allows flexible data storage and supports indexing (e.g., GIN index) for performance optimization.
* Queries on JSONB can be slightly more complex than standard SQL queries, but for mid-sized projects, this is manageable.
* If most of the project data is structured, sticking to PostgreSQL without MongoDB simplifies architecture and reduces system complexity.


# tables 
## `users` Table: Store User Account Information
* The `email` field uses `VARCHAR(255)`, as per the RFC standard for email addresses.
* `user_id` is stored as `VARCHAR(50)` (e.g., from authentication services like Clerk).

```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,       -- user ID from clerk
    username VARCHAR(20) NOT NULL,         -- length may be adjusted
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## `user_preferences Table`: Store User Preferences
* Each user will have four records, each representing a different preference type.
* `weight` helps determine the importance of each preference.
* `preference_order` can be used for explicit sorting.

```sql
CREATE TABLE user_preferences (
    user_id VARCHAR(50) NOT NULL,
    preference_type VARCHAR(50) NOT NULL
      CHECK (preference_type IN ('distance', 'price', 'amenity', 'neighborhood_safety')),
    weight NUMERIC(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1), 
    preference_order SMALLINT,
    PRIMARY KEY (user_id, preference_type),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
```

## `properties` Table：Store Property Listings
* The `address` object is split into 'street', 'suburb', 'state', 'postcode' for easier querying and indexing.
* The `photo` field is an array (`TEXT[]`), allowing multiple images per property.
* `property_type` is a single value (`TEXT`), assuming each property belongs to only one category.

```sql
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
    property_type TEXT,
    safety_score NUMERIC(3,2) NOT NULL CHECK (safety_score >= 0 AND safety_score <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


## `poi_markers`Table: Store Points of Interest (POI)
* Stores user-defined locations like workplaces, gyms, schools, etc.
* `photo` field supports multiple images.

```sql
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
```

## `saved_groups` Table: Store User's Saved Search Configurations
* A user may save multiple groups to compare listings in different areas.
* The `group_name` is unique per user to prevent duplication.

```sql
CREATE TABLE saved_groups (
    group_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    group_name TEXT NOT NULL UNIQUE,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_groups_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
```

## `saved_pois` Table: Store POIs in Each Saved Group
* Each saved search group can contain multiple POIs.

```sql
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
```

## `saved_properties` Table: Store Properties in Each Saved Group
* Each saved search group can contain multiple properties.

```sql
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
```
