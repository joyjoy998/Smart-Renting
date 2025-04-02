import os
import csv
import psycopg2
from dotenv import load_dotenv
import ast

# 加载环境变量（请确保 .env.local 文件中包含 POSTGRES_HOST、POSTGRES_DATABASE、POSTGRES_USER、POSTGRES_PASSWORD 等配置）
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)

# 数据库连接参数
DB_HOST = os.environ.get("POSTGRES_HOST")
DB_NAME = os.environ.get("POSTGRES_DATABASE")
DB_USER = os.environ.get("POSTGRES_USER")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
DB_PORT = "5432"  # 默认端口

# 建立数据库连接
conn = psycopg2.connect(
    host=DB_HOST,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT
)

# CSV 文件路径（请根据实际情况修改）
csv_file_path = os.path.join(os.path.dirname(__file__), "sydney_processed.csv")

def parse_pg_array(array_str):
    """
    将类似 {"url1","url2"} 的字符串转换为 Python 列表 ["url1", "url2"]。
    如果数组为空，返回空列表。
    """
    if not array_str or array_str == '{}':
        return []
    try:
        # 将花括号替换为方括号，再用 ast.literal_eval 解析为列表
        list_str = array_str.replace('{', '[').replace('}', ']')
        return ast.literal_eval(list_str)
    except Exception as e:
        print("解析数组字符串出错:", array_str, e)
        return []

def main():
    insert_query = """
    INSERT INTO properties 
        (street, suburb, state, postcode, weekly_rent, photo, bedrooms, bathrooms, parking_spaces, property_type, safety_score)
    VALUES 
        (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        data = list(reader)
    
    cur = conn.cursor()
    for record in data:
        # 将 CSV 中 photo 字段转换为 Python 列表
        photo_array = parse_pg_array(record["photo"])
        # 执行插入操作，safety_score 统一设置为 0
        cur.execute(insert_query, (
            record["street"],
            record["suburb"],
            record["state"],
            record["postcode"],
            record["weekly_rent"],
            photo_array,
            record["bedrooms"],
            record["bathrooms"],
            record["parking_spaces"],
            record["property_type"],
            0.0  # 默认 safety_score
        ))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"成功导入 {len(data)} 条记录到 properties 表")

if __name__ == '__main__':
    main()
