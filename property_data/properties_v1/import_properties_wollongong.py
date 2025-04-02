from dotenv import load_dotenv
import os
import json
import psycopg2

env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)
json_file_path = os.path.join(os.path.dirname(__file__), "parsed_properties_wollongong.json")

DB_HOST = os.environ.get("POSTGRES_HOST")
DB_NAME = os.environ.get("POSTGRES_DATABASE")
DB_USER = os.environ.get("POSTGRES_USER")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
DB_PORT = "5432" # default port

conn = psycopg2.connect(
    host=DB_HOST,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT
)

def main():
    insert_query = """
    INSERT INTO properties 
        (street, suburb, state, postcode, weekly_rent, photo, bedrooms, bathrooms, parking_spaces, property_type, safety_score)
    VALUES 
        (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cur = conn.cursor()
    for record in data:
        cur.execute(insert_query, (
            record.get("street"),
            record.get("suburb"),
            record.get("state"),
            record.get("postcode"),
            record.get("weekly_rent"),
            record.get("photo"),
            record.get("bedrooms"),
            record.get("bathrooms"),
            record.get("parking_spaces"),
            record.get("property_type"),
            record.get("safety_score", 0.0)  # 如果 safety_score 没有，默认设为 0.0
        ))
    conn.commit()
    cur.close()
    conn.close()

    print(f"成功导入 {len(data)} 条记录到 properties 表")

if __name__ == '__main__':
    main()
