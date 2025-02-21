import os
import json
import psycopg2

DB_HOST = os.environ.get("POSTGRES_HOST")
DB_NAME = os.environ.get("POSTGRES_DATABASE")
DB_USER = os.environ.get("POSTGRES_USER")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
DB_PORT = "5432"  # 如果 .env.local 没有显式定义，可以手动指定

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
        (street, suburb, state, postcode, weekly_rent, photo, bedrooms, bathrooms, parking_spaces, property_type)
    VALUES 
        (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    json_file_path = "property_data/parsed_properties_modified.json"

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
            record.get("property_type")
        ))
    conn.commit()
    cur.close()
    conn.close()

    print(f"成功导入 {len(data)} 条记录到 properties 表")

if __name__ == '__main__':
    main()
