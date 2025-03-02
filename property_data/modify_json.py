import json
import re

def process_record(record):
    """
    处理单条房源记录，将其字段名和数据格式改成与数据库 schema 一致。
    """

    # 1. 地址相关字段
    street = record.get("street", "").strip()
    suburb = record.get("suburb", "").strip()
    state = record.get("state", "").strip()
    postcode = record.get("postcode", "").strip()

    # 2. weeklyRent -> weekly_rent
    #    例如 "$1,400" -> "1400" -> float 或 int，这里选 float 方便兼容 decimal(10,2)
    weekly_rent_str = record.get("weeklyRent", "").replace(",", "")
    rent_match = re.search(r'\d+(\.\d+)?', weekly_rent_str)  # 支持带小数
    if rent_match:
        weekly_rent = float(rent_match.group())
    else:
        weekly_rent = 0.0

    # 3. photo (原 image)
    #    如果原字段为空或不存在，则为 []
    image_value = record.get("image", "").strip()
    if image_value:
        photo = [image_value]
    else:
        photo = []

    # 4. bedrooms, bathrooms, parkingSpaces -> parking_spaces
    try:
        bedrooms = int(record.get("bedrooms", "0"))
    except ValueError:
        bedrooms = 0

    try:
        bathrooms = int(record.get("bathrooms", "0"))
    except ValueError:
        bathrooms = 0

    try:
        parking_spaces = int(record.get("parkingSpaces", "0"))
    except ValueError:
        parking_spaces = 0

    # 5. propertyType -> property_type
    #    不拆分，保留原字符串
    property_type = record.get("propertyType", "").strip()

    # 6. 构造新的字典，键名与数据库 schema 对应
    new_record = {
        "street": street,
        "suburb": suburb,
        "state": state,
        "postcode": postcode,
        "weekly_rent": weekly_rent,
        "photo": photo,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "parking_spaces": parking_spaces,
        "property_type": property_type
    }

    return new_record

def main():
    # 读取原始 JSON 文件
    with open('parsed_properties.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 对每条记录进行处理
    new_data = [process_record(record) for record in data]

    # 将处理后的数据写入新的 JSON 文件
    with open('parsed_properties_modified.json', 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)

    print(f"转换完成，共处理 {len(new_data)} 条记录，结果保存为 parsed_properties_modified.json")

if __name__ == '__main__':
    main()
