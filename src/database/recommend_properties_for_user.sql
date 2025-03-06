-- -- 欧几里得距离计算语义相似度
-- -- PostGIS拓展
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- CREATE OR REPLACE FUNCTION recommend_properties_for_user(user_id UUID, group_id INT)
-- RETURNS TABLE(property_id INT, final_score FLOAT)
-- LANGUAGE SQL
-- AS $$
-- WITH user_pois AS (
--     -- ❶ 获取当前 group_id 下 **该用户** 标记的 POI
--     SELECT latitude, longitude 
--     FROM saved_pois 
--     WHERE group_id = group_id AND user_id = user_id
-- ),
-- user_properties AS (
--     -- ❷ 获取当前 group_id 下 **该用户** 标记的房源
--     SELECT property_id 
--     FROM saved_properties 
--     WHERE group_id = group_id AND user_id = user_id
-- ),
-- weights AS (
--     -- ❸ 计算 α（语义匹配权重）和 β（地理距离权重）
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
--                    THEN (1 - (v.embedding <=> (
--                         SELECT AVG(embedding) 
--                         FROM property_vectors 
--                         WHERE property_id IN (SELECT property_id FROM user_properties)
--                    ))) 
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

-- 余弦相似度计算语义相似度(不准确)
-- CREATE OR REPLACE FUNCTION recommend_properties_for_user(user_id UUID, group_id INT)
-- RETURNS TABLE(property_id INT, final_score FLOAT)
-- LANGUAGE SQL
-- AS $$
-- WITH user_pois AS (
--     SELECT latitude, longitude 
--     FROM saved_pois 
--     WHERE group_id = group_id AND user_id = user_id
-- ),
-- user_properties AS (
--     SELECT property_id 
--     FROM saved_properties 
--     WHERE group_id = group_id AND user_id = user_id
-- ),
-- weights AS (
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
--                    THEN (
--                        (
--                            v.embedding <#> (
--                                SELECT AVG(embedding)::vector 
--                                FROM property_vectors 
--                                WHERE property_id IN (SELECT property_id FROM user_properties)
--                            )
--                        ) / (
--                            sqrt(GREATEST(v.embedding <#> v.embedding, 0.00001)) * 
--                            sqrt(GREATEST(
--                                (SELECT AVG(embedding)::vector 
--                                 FROM property_vectors 
--                                 WHERE property_id IN (SELECT property_id FROM user_properties)) <#> 
--                                (SELECT AVG(embedding)::vector 
--                                 FROM property_vectors 
--                                 WHERE property_id IN (SELECT property_id FROM user_properties)),
--                                0.00001
--                            ))
--                        )
--                    ) 
--                    ELSE 0
--                END
--            ) 
--            + 
--            (SELECT beta FROM weights) * (
--                CASE 
--                    WHEN EXISTS (SELECT 1 FROM user_pois) 
--                    THEN (1 / (1 + (
--                        SELECT AVG(ST_DistanceSphere(
--                              ST_MakePoint(p.longitude::NUMERIC, p.latitude::NUMERIC)::GEOMETRY, 
--                              ST_MakePoint(sp.longitude::NUMERIC, sp.latitude::NUMERIC)::GEOMETRY
--                         ))
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
--           WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) 
--           THEN (SELECT COUNT(*) FROM properties)  
--           ELSE 5
--        END;
-- $$;

-- 余弦相似度
CREATE OR REPLACE FUNCTION recommend_properties_for_user(user_id text, group_id INT)
RETURNS TABLE(property_id INT, final_score FLOAT)
LANGUAGE SQL
AS $$
WITH user_pois AS (
    -- ❶ 获取当前 group_id 下 **该用户** 标记的 POI
    SELECT latitude, longitude 
    FROM saved_pois 
    WHERE group_id = recommend_properties_for_user.group_id -- 修正为传入的 group_id
      AND group_id IN (SELECT group_id FROM saved_groups WHERE user_id = recommend_properties_for_user.user_id) -- 修正为传入的 user_id
),
user_properties AS (
    -- ❷ 获取当前 group_id 下 **该用户** 标记的房源
    SELECT property_id 
    FROM saved_properties 
    WHERE group_id = $2 -- 使用参数占位符引用传入的 group_id
      AND group_id IN (SELECT group_id FROM saved_groups WHERE user_id = $1) -- 使用参数占位符引用传入的 user_id
),
weights AS (
    -- ❸ 计算 α（语义匹配权重）和 β（地理距离权重）
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.7
            WHEN EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) THEN 1.0
            WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.0
            ELSE 0.0
        END AS alpha,
        CASE 
            WHEN EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 0.3
            WHEN EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) THEN 0.0
            WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND EXISTS (SELECT 1 FROM user_pois) THEN 1.0
            ELSE 0.0
        END AS beta
),
property_scores AS (
    SELECT p.property_id,
           (SELECT alpha FROM weights) * (
               CASE 
                   WHEN EXISTS (SELECT 1 FROM user_properties) 
                   THEN (1 - (v.embedding <=> (
                        SELECT AVG(embedding) 
                        FROM property_vectors 
                        WHERE property_id IN (SELECT property_id FROM user_properties)
                   ))) 
                   ELSE 0
               END
           ) 
           + 
           (SELECT beta FROM weights) * (
               CASE 
                   WHEN EXISTS (SELECT 1 FROM user_pois) 
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
    JOIN property_vectors v ON p.property_id = v.property_id  
    WHERE 
        (NOT EXISTS (SELECT 1 FROM user_properties) OR p.property_id NOT IN (SELECT property_id FROM user_properties))
)
SELECT property_id, final_score
FROM property_scores
ORDER BY final_score DESC
LIMIT CASE 
         WHEN NOT EXISTS (SELECT 1 FROM user_properties) AND NOT EXISTS (SELECT 1 FROM user_pois) 
         THEN (SELECT COUNT(*) FROM properties)  
         ELSE 5
       END;
$$;
