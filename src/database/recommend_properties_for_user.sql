CREATE OR REPLACE FUNCTION scalar_multiply_vector(vec vector, scalar numeric)
RETURNS vector AS $$
DECLARE
    result vector;
    i int;
BEGIN
    result := '{}';
    FOR i IN 1..array_length(vec, 1) LOOP
        result := array_append(result, vec[i] * scalar);
    END LOOP;
    RETURN result;
END;

$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION recommend_properties_for_user(
    user_id text, 
    group_id INT,
    map_lat FLOAT DEFAULT NULL,  
    map_lng FLOAT DEFAULT NULL   
) 
RETURNS TABLE(property_id INT, final_score FLOAT)  
LANGUAGE SQL AS $$

WITH 
-- Retrieve POIs (Points of Interest) marked by the user
user_pois AS (
    SELECT latitude, longitude 
    FROM saved_pois sp
    JOIN saved_groups sg ON sp.group_id = sg.group_id
    WHERE sp.group_id = recommend_properties_for_user.group_id
       AND sg.user_id = recommend_properties_for_user.user_id
), 

-- Retrieve system properties marked by the user (with property_id)
user_system_properties AS (
    SELECT 
        p.property_id  
    FROM saved_properties sp
    JOIN properties p ON sp.property_id = p.property_id
    JOIN saved_groups sg ON sp.group_id = sg.group_id
    WHERE sp.group_id = recommend_properties_for_user.group_id
       AND sg.user_id = recommend_properties_for_user.user_id
       AND sp.property_id IS NOT NULL
),

-- Retrieve custom properties marked by the user (with place_id but no property_id)
user_custom_properties AS (
    SELECT 
        sp.place_id
    FROM saved_properties sp
    JOIN saved_groups sg ON sp.group_id = sg.group_id
    WHERE sp.group_id = recommend_properties_for_user.group_id
       AND sg.user_id = recommend_properties_for_user.user_id
       AND sp.property_id IS NULL
       AND sp.place_id IS NOT NULL
),

-- check whether user has saved data
user_has_any_data AS (
    SELECT 
        EXISTS (SELECT 1 FROM user_pois) OR
        EXISTS (SELECT 1 FROM user_system_properties) OR
        EXISTS (SELECT 1 FROM user_custom_properties) AS has_data
),

-- if no saved data but has mapcenter data, then calculate distnace score
map_center_proximity AS (
    SELECT 
        p.property_id,
        CASE 
         
            WHEN NOT (SELECT has_data FROM user_has_any_data) AND 
                 map_lat IS NOT NULL AND 
                 map_lng IS NOT NULL
            THEN (
                1 / (1 + ST_DistanceSphere(
                    ST_MakePoint(p.longitude::NUMERIC, p.latitude::NUMERIC)::GEOMETRY,
                    ST_MakePoint(map_lng::NUMERIC, map_lat::NUMERIC)::GEOMETRY
                ) / 1000) 
            )
            ELSE 0
        END AS proximity_score
    FROM properties p
),

-- Compute weight coefficients: α (semantic similarity weight) and β (geographical distance weight)
weights AS (
    WITH user_has_properties AS (
        SELECT EXISTS (SELECT 1 FROM user_system_properties) OR 
               EXISTS (SELECT 1 FROM user_custom_properties) AS has_props
    ),
    user_has_pois AS (
        SELECT EXISTS (SELECT 1 FROM user_pois) AS has_pois
    )
    SELECT 
        -- Semantic weight (alpha)
        CASE
            -- User has properties
            WHEN (SELECT has_props FROM user_has_properties) THEN
                CASE
                    -- User also has POIs (properties + POIs)
                    WHEN (SELECT has_pois FROM user_has_pois) THEN 0.7
                    -- Only properties, no POIs
                    ELSE 1.0
                END
            -- User has no properties
            ELSE 0.0
        END AS alpha,
        
        -- Geographical weight (beta)
        CASE
            -- User has properties
            WHEN (SELECT has_props FROM user_has_properties) THEN
                CASE
                    -- User also has POIs (properties + POIs)
                    WHEN (SELECT has_pois FROM user_has_pois) THEN 0.3
                    -- Only properties, no POIs
                    ELSE 0.0
                END
            -- User has no properties, but has POIs
            WHEN (SELECT has_pois FROM user_has_pois) THEN 1.0
            -- User has neither properties nor POIs
            ELSE 0.0
        END AS beta
),

-- Compute the average vector for user-saved system properties
user_system_avg_embedding AS (
    SELECT AVG(embedding)::vector AS avg_vec
    FROM property_vectors
    WHERE property_id IN (SELECT property_id FROM user_system_properties) 
),

-- Compute the average vector for user-saved custom properties
user_custom_avg_embedding AS (
    SELECT AVG(embedding)::vector AS avg_vec
    FROM user_saved_property_vectors
    WHERE place_id IN (SELECT place_id FROM user_custom_properties)
),

-- Compute combined average embedding (if both types exist)
combined_avg_embedding AS (
    SELECT 
        CASE 
            -- If both types exist, compute weighted average
            WHEN EXISTS (SELECT 1 FROM user_system_avg_embedding WHERE avg_vec IS NOT NULL)
                 AND EXISTS (SELECT 1 FROM user_custom_avg_embedding WHERE avg_vec IS NOT NULL)
            THEN (
                scalar_multiply_vector((SELECT avg_vec FROM user_system_avg_embedding), 0.5) + 
                scalar_multiply_vector((SELECT avg_vec FROM user_custom_avg_embedding), 0.5)
            )::vector
            -- If only system properties exist
            WHEN EXISTS (SELECT 1 FROM user_system_avg_embedding WHERE avg_vec IS NOT NULL)
            THEN (SELECT avg_vec FROM user_system_avg_embedding)
            -- If only custom properties exist
            WHEN EXISTS (SELECT 1 FROM user_custom_avg_embedding WHERE avg_vec IS NOT NULL)
            THEN (SELECT avg_vec FROM user_custom_avg_embedding)
            -- Default case
            ELSE NULL
        END AS avg_vec
),

-- Compute scores for all properties
property_scores AS (
    SELECT 
        p.property_id,
        -- user has saved data, using semantic score and distance score
        CASE 
            WHEN (SELECT has_data FROM user_has_any_data) THEN
                -- Total score = α * semantic score + β * geographical score
                (SELECT alpha FROM weights) * (
                    CASE
                        -- When we have a combined average embedding
                        WHEN EXISTS (SELECT 1 FROM combined_avg_embedding WHERE avg_vec IS NOT NULL)
                        THEN (
                            -- Compute the similarity to the aggregated average vector
                            1 - (pv.embedding <=> (SELECT avg_vec FROM combined_avg_embedding))
                        )
                        ELSE 0  -- If there is no valid average vector, the score is 0.
                    END
                )
                +
                (SELECT beta FROM weights) * (
                    CASE
                        WHEN EXISTS (SELECT 1 FROM user_pois)
                        -- Compute geographical score using inverse distance as similarity measure
                        THEN (1 / (1 + (
                            SELECT AVG(ST_DistanceSphere(
                                ST_MakePoint(p.longitude::NUMERIC, p.latitude::NUMERIC)::GEOMETRY,
                                ST_MakePoint(sp.longitude::NUMERIC, sp.latitude::NUMERIC)::GEOMETRY
                            ))
                            FROM user_pois sp
                        )))
                        ELSE 0
                    END
                )
            -- if user has no data,recommend based on mapcenter
            ELSE (
                SELECT proximity_score 
                FROM map_center_proximity 
                WHERE map_center_proximity.property_id = p.property_id
            )
        END AS final_score
    FROM properties p
    LEFT JOIN property_vectors pv ON p.property_id = pv.property_id
    WHERE
        -- 用户有数据时，排除已保存的房源
        (
            (SELECT has_data FROM user_has_any_data) = FALSE
            OR
            (
                p.property_id NOT IN (SELECT property_id FROM user_system_properties)
                AND 
                (p.place_id IS NULL OR p.place_id NOT IN (SELECT place_id FROM user_custom_properties WHERE place_id IS NOT NULL))
            )
        )
),

-- Handle NULL values and ensure final_score is a valid number
cleaned_scores AS (
    SELECT 
        property_id,
        CASE 
            WHEN final_score IS NULL OR final_score = 'NaN'::FLOAT OR final_score = 'Infinity'::FLOAT 
            THEN 0 
            ELSE final_score 
        END AS final_score
    FROM property_scores
)

-- Return results: Sort by descending score
SELECT property_id, final_score 
FROM cleaned_scores 
WHERE final_score > 0  -- Only include properties with positive scores
ORDER BY final_score DESC 
LIMIT 50;  


$$;

