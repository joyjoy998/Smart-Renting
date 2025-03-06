
-- 欧几里得计算相似度
CREATE OR REPLACE FUNCTION recommend_properties_for_user(user_id text, group_id INT)
RETURNS TABLE(property_id INT, final_score FLOAT)
LANGUAGE SQL
AS $$
WITH user_pois AS (
    -- ❶ 获取当前 group_id 和 user_id 下标记的 POI
    SELECT latitude, longitude 
    FROM saved_pois sp
    JOIN saved_groups sg ON sp.group_id = sg.group_id
    WHERE sp.group_id = recommend_properties_for_user.group_id 
      AND sg.user_id = recommend_properties_for_user.user_id
),
user_properties AS (
    -- ❷ 获取当前 group_id 和 user_id 下标记的房源
    SELECT property_id 
    FROM saved_properties sp
    JOIN saved_groups sg ON sp.group_id = sg.group_id
    WHERE sp.group_id = recommend_properties_for_user.group_id 
      AND sg.user_id = recommend_properties_for_user.user_id
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