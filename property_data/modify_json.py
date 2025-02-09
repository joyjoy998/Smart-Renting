import json
import re

def process_record(record):
    # 1. 将地址字段合并到 address 中，并从原记录中移除
    address = {
        "street": record.pop("street", ""),
        "suburb": record.pop("suburb", ""),
        "state": record.pop("state", ""),
        "postcode": record.pop("postcode", "")
    }
    record["address"] = address

    # 2. weeklyRent 处理：先移除逗号，再提取数字并转换为整数
    weekly_rent_str = record.get("weeklyRent", "")
    weekly_rent_str = weekly_rent_str.replace(",", "")  # 例如 "$1,400" -> "$1400"
    rent_match = re.search(r'\d+', weekly_rent_str)
    if rent_match:
        record["weeklyRent"] = int(rent_match.group())
    else:
        record["weeklyRent"] = 0

    # 3. 将 bedrooms, bathrooms, parkingSpaces 转为整数
    for key in ["bedrooms", "bathrooms", "parkingSpaces"]:
        try:
            record[key] = int(record.get(key, "0"))
        except ValueError:
            record[key] = 0

    # 4. propertyType 处理：如果包含 "/" 则拆分成数组，否则保持原字符串
    property_type_str = record.get("propertyType", "").strip()
    if "/" in property_type_str:
        record["propertyType"] = [part.strip() for part in property_type_str.split("/") if part.strip()]
    else:
        record["propertyType"] = [property_type_str]

    # 5. image 处理：如果值为空则存成空数组，否则包装成数组
    image_value = record.get("image", "").strip()
    if image_value:
        record["image"] = [image_value]
    else:
        record["image"] = []

    # 6. 重新构造记录，确保键的顺序：address 放第一，其后依次是 weeklyRent, image, bedrooms, bathrooms, parkingSpaces, propertyType
    ordered_record = {
        "address": record.get("address", {}),
        "weeklyRent": record.get("weeklyRent", 0),
        "image": record.get("image", []),
        "bedrooms": record.get("bedrooms", 0),
        "bathrooms": record.get("bathrooms", 0),
        "parkingSpaces": record.get("parkingSpaces", 0),
        "propertyType": record.get("propertyType", "")
    }
    return ordered_record

def main():
    # 读取原始 JSON 文件
    with open('parsed_properties.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 对每条记录进行处理，并重构键的顺序
    new_data = [process_record(record) for record in data]

    # 将处理后的数据写入新的 JSON 文件
    with open('parsed_properties_modified.json', 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)

    print(f"转换完成，共处理 {len(new_data)} 条记录，结果保存为 parsed_properties_modified.json")

if __name__ == '__main__':
    main()
