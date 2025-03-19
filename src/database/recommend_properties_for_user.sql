-- -- Euclidean Similarity Calculation
-- CREATE OR REPLACE FUNCTION recommend_properties_for_user(user_id text, group_id INT)
-- RETURNS TABLE(property_id INT, final_score FLOAT)
-- LANGUAGE SQL
-- AS $$
-- WITH user_pois AS (
--     -- ❶ Retrieve POIs (Points of Interest) marked under the given group_id and user_id
--     SELECT latitude, longitude 
--     FROM saved_pois sp
--     JOIN saved_groups sg ON sp.group_id = sg.group_id
--     WHERE sp.group_id = recommend_properties_for_user.group_id 
--       AND sg.user_id = recommend_properties_for_user.user_id
-- ),
-- user_properties AS (
--     -- ❷ Retrieve properties marked under the given group_id and user_id
--     SELECT property_id 
--     FROM saved_properties sp
--     JOIN saved_groups sg ON sp.group_id = sg.group_id
--     WHERE sp.group_id = recommend_properties_for_user.group_id 
--       AND sg.user_id = recommend_properties_for_user.user_id
-- ),
-- weights AS (
--     -- ❸ Compute α (semantic similarity weight) and β (geographical distance weight)
--     SELECT 
--         CASE 
--             WHEN EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.7
--             WHEN EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) THEN 1.0
--             WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.0
--             ELSE 0.0
--         END AS alpha,
--         CASE 
--             WHEN EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.3
--             WHEN EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) THEN 0.0
--             WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 1.0
--             ELSE 0.0
--         END AS beta
-- ),
-- property_scores AS (
--     SELECT p.property_id,
--            (SELECT alpha FROM weights) * (
--                CASE 
--                    WHEN EXISTS (SELECT 1 FROM user_properties) 
--                    -- Euclidean Distance Calculation
--                    THEN (1 / (1 + (v.embedding <-> (
--                         SELECT AVG(embedding) 
--                         FROM property_vectors 
--                         WHERE property_id IN (SELECT property_id FROM user_properties)
--                    )::vector)))
--                    ELSE 0
--                END
--            ) 
--            + 
--            (SELECT beta FROM weights) * (
--                CASE 
--                    WHEN EXISTS (SELECT 1 FROM user_pois) 
--                    THEN (1 / (1 + (
--                        SELECT AVG(ST_DistanceSphere(
--                             ST_MakePoint(p.longitude::NUMERIC, p.latitude::NUMERIC)::GEOMETRY, 
--                             ST_MakePoint(sp.longitude::NUMERIC, sp.latitude::NUMERIC)::GEOMETRY
--                        ))
--                        FROM user_pois sp
--                    ))) 
--                    ELSE 0 
--                END
--            ) 
--            AS final_score
--     FROM properties p
--     JOIN property_vectors v ON p.property_id = v.property_id  
--     WHERE 
--         (NOT EXISTS (SELECT 1 FROM user_properties) OR p.property_id NOT IN (SELECT property_id FROM user_properties))
-- )
-- SELECT property_id, final_score
-- FROM property_scores
-- ORDER BY final_score DESC
-- LIMIT CASE 
--          WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) 
--          THEN (SELECT COUNT(*) FROM properties)  
--          ELSE 5
--        END;
-- $$;

-- -- Create or replace the recommendation function using Cosine Similarity
-- CREATE OR REPLACE FUNCTION recommend_properties_for_user(user_id text, group_id INT) 
-- RETURNS TABLE(property_id INT, final_score FLOAT) 
-- LANGUAGE SQL AS $$

-- WITH 
-- -- Retrieve POIs (Points of Interest) marked by the user
-- user_pois AS (
--     SELECT latitude, longitude 
--     FROM saved_pois sp
--     JOIN saved_groups sg ON sp.group_id = sg.group_id
--     WHERE sp.group_id = recommend_properties_for_user.group_id
--        AND sg.user_id = recommend_properties_for_user.user_id
-- ), 

-- -- Retrieve properties marked by the user
-- user_properties AS (
--     SELECT property_id 
--     FROM saved_properties sp
--     JOIN saved_groups sg ON sp.group_id = sg.group_id
--     WHERE sp.group_id = recommend_properties_for_user.group_id
--        AND sg.user_id = recommend_properties_for_user.user_id
-- ), 

-- -- Compute weight coefficients: α (semantic similarity weight) and β (geographical distance weight)
-- -- Adjust weights dynamically based on user data
-- weights AS (
--     SELECT 
--         CASE
--             -- If both properties and POIs exist, set semantic weight to 0.7
--             WHEN EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.7
--             -- If only properties exist and no POIs, set semantic weight to 1.0 (fully dependent on semantics)
--             WHEN EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) THEN 1.0
--             -- If only POIs exist and no properties, set semantic weight to 0 (fully dependent on geography)
--             WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.0
--             -- Default case
--             ELSE 0.0
--         END AS alpha,
--         CASE
--             -- If both properties and POIs exist, set geographical weight to 0.3
--             WHEN EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.3
--             -- If only properties exist and no POIs, set geographical weight to 0 (fully dependent on semantics)
--             WHEN EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) THEN 0.0
--             -- If only POIs exist and no properties, set geographical weight to 1.0 (fully dependent on geography)
--             WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 1.0
--             -- Default case
--             ELSE 0.0
--         END AS beta
-- ),

-- -- Fix: Compute the average vector for user-saved properties (for cosine similarity calculation)
-- user_avg_embedding AS (
--     SELECT AVG(embedding)::vector AS avg_vec
--     FROM property_vectors
--     WHERE property_id IN (SELECT property_id FROM user_properties)
-- ),

-- -- Compute scores for all properties
-- property_scores AS (
--     SELECT 
--         p.property_id,
--         -- Total score = α * semantic score + β * geographical score
--         (SELECT alpha FROM weights) * (
--             CASE
--                 WHEN EXISTS (SELECT 1 FROM user_properties)
--                 -- Compute cosine similarity using the <=> operator
--                 THEN (1 - (v.embedding <=> (SELECT avg_vec FROM user_avg_embedding)))
--                 ELSE 0
--             END
--         )
--         +
--         (SELECT beta FROM weights) * (
--             CASE
--                 WHEN EXISTS (SELECT 1 FROM user_pois)
--                 -- Compute geographical score using inverse distance as similarity measure
--                 THEN (1 / (1 + (
--                     SELECT AVG(ST_DistanceSphere(
--                         ST_MakePoint(p.longitude::NUMERIC, p.latitude::NUMERIC)::GEOMETRY,
--                         ST_MakePoint(sp.longitude::NUMERIC, sp.latitude::NUMERIC)::GEOMETRY
--                     ))
--                     FROM user_pois sp
--                 )))
--                 ELSE 0
--             END
--         )
--         AS final_score
--     FROM properties p
--     JOIN property_vectors v ON p.property_id = v.property_id
--     WHERE
--         -- Exclude properties already saved by the user
--         (NOT EXISTS (SELECT 1 FROM user_properties) OR 
--          p.property_id NOT IN (SELECT property_id FROM user_properties))
-- )

-- -- Return results: Sort by descending score
-- SELECT property_id, final_score 
-- FROM property_scores 
-- ORDER BY final_score DESC 
-- -- If the user has not saved any properties or POIs, return all properties; otherwise, return the top 5
-- LIMIT CASE
--     WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois)
--     THEN (SELECT COUNT(*) FROM properties)
--     ELSE 5
-- END;

-- $$;
-- Create or replace the recommendation function using Cosine Similarity
CREATE OR REPLACE FUNCTION recommend_properties_for_user(user_id text, group_id INT) 
RETURNS TABLE(property_id TEXT, final_score FLOAT) 
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

-- Retrieve properties marked by the user 
user_properties AS (
    SELECT 
        COALESCE(p.property_id::TEXT, p2.place_id) AS property_id
    FROM saved_properties sp
    LEFT JOIN properties p ON sp.saved_property_id = p.property_id  
    LEFT JOIN properties p2 ON sp.place_id = p2.place_id  
    JOIN saved_groups sg ON sp.group_id = sg.group_id
    WHERE sp.group_id = recommend_properties_for_user.group_id
       AND sg.user_id = recommend_properties_for_user.user_id
), 

-- Compute weight coefficients: α (semantic similarity weight) and β (geographical distance weight)
weights AS (
    SELECT 
        CASE
            -- If both properties and POIs exist, set semantic weight to 0.7
            WHEN EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.7
            -- If only properties exist and no POIs, set semantic weight to 1.0 (fully dependent on semantics)
            WHEN EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) THEN 1.0
            -- If only POIs exist and no properties, set semantic weight to 0 (fully dependent on geography)
            WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.0
            -- Default case
            ELSE 0.0
        END AS alpha,
        CASE
            -- If both properties and POIs exist, set geographical weight to 0.3
            WHEN EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.3
            -- If only properties exist and no POIs, set geographical weight to 0 (fully dependent on semantics)
            WHEN EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) THEN 0.0
            -- If only POIs exist and no properties, set geographical weight to 1.0 (fully dependent on geography)
            WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 1.0
            -- Default case
            ELSE 0.0
        END AS beta
),

-- Fix: Compute the average vector for user-saved properties (for cosine similarity calculation)
user_avg_embedding AS (
    SELECT AVG(embedding)::vector AS avg_vec
    FROM property_vectors
    WHERE property_id IN (SELECT property_id::INTEGER FROM user_properties)  -- 需要转换回 INTEGER
),

-- Compute scores for all properties
property_scores AS (
    SELECT 
        COALESCE(p.property_id::TEXT, p2.place_id) AS property_id,  -- 强制转换 property_id 为 TEXT
        -- Total score = α * semantic score + β * geographical score
        (SELECT alpha FROM weights) * (
            CASE
                WHEN EXISTS (SELECT 1 FROM user_properties)
                -- Compute cosine similarity using the <=> operator
                THEN (1 - (v.embedding <=> (SELECT avg_vec FROM user_avg_embedding)))
                ELSE 0
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
        AS final_score
    FROM properties p
    LEFT JOIN properties p2 ON p.place_id = p2.place_id  -- 确保可以关联 place_id
    JOIN property_vectors v ON p.property_id = v.property_id
    WHERE
        -- Exclude properties already saved by the user
        (NOT EXISTS (SELECT 1 FROM user_properties) OR 
         COALESCE(p.property_id::TEXT, p2.place_id) NOT IN (SELECT property_id FROM user_properties))
)

-- Return results: Sort by descending score
SELECT property_id, final_score 
FROM property_scores 
ORDER BY final_score DESC 
-- If the user has not saved any properties or POIs, return all properties; otherwise, return the top 5
LIMIT CASE
    WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois)
    THEN (SELECT COUNT(*) FROM properties)
    ELSE 5
END;

$$;
