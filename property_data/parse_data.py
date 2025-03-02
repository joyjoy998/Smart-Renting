import re
import json
import glob

def parse_property(text):
    """
    解析单个房源条目，返回一个字典，字段包括：
      street, suburb, state, postcode, weeklyRent, image, bedrooms, bathrooms, parkingSpaces, propertyType
    """
    # 初始化结果字典，全部字段先置为空
    result = {
        "street": "",
        "suburb": "",
        "state": "",
        "postcode": "",
        "weeklyRent": "",
        "image": "",
        "bedrooms": "",
        "bathrooms": "",
        "parkingSpaces": "",
        "propertyType": ""
    }
    
    # 将文本按行拆分，并去除空行
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    
    # ---------------------------
    # 1. 提取图片链接（取第一张图片作为 property image）
    # Markdown 图片格式示例：
    # [![Image 140: Picture of ...](图片链接)](外部链接)
    # 我们需要取嵌套的 ![...](...) 中的图片链接
    image_pattern = re.compile(r'\[!\[.*?\]\((.*?)\)\]')
    for line in lines:
        m = image_pattern.search(line)
        if m:
            result["image"] = m.group(1)
            break
    
    # ---------------------------
    # 2. 提取价格：查找以 $ 开头的行
    price_pattern = re.compile(r'^\$\d+')
    for line in lines:
        if price_pattern.search(line):
            result["weeklyRent"] = line
            break

    # ---------------------------
    # 3. 提取地址：Markdown 链接格式：[地址 ---](链接)
    # 用正则匹配中括号内的地址部分
    address_pattern = re.compile(r'\[(.*?)\s+-+\]\(.*?\)')
    raw_location = ""
    for line in lines:
        m = address_pattern.search(line)
        if m:
            raw_location = m.group(1).strip()
            break
    
    # 如果找到了地址，则拆分成 street, suburb, state, postcode
    # 假设 raw_location 已经取得类似 "fairy meadow NSW 2500" 的字符串
    if raw_location:
        parts = raw_location.split(',')
        if len(parts) == 2:
            street = parts[0].strip()
            rest = parts[1].strip()
            # 用空格拆分后查找 state 代码
            rest_parts = rest.split()
            # 定义澳洲州代码集合（统一用大写做比较）
            state_codes = {"NSW", "VIC", "ACT", "NT", "WA", "SA", "QLD", "TAS"}
            state_index = None
            for i, token in enumerate(rest_parts):
                if token.upper() in state_codes:
                    state_index = i
                    break
            if state_index is not None and state_index + 1 < len(rest_parts):
                # 将 state 前面的所有单词拼接为 suburb
                suburb = " ".join(rest_parts[:state_index])
                state = rest_parts[state_index]
                postcode = rest_parts[state_index + 1]
            else:
                suburb = rest
                state = ""
                postcode = ""
        else:
            street = raw_location
            suburb = state = postcode = ""

        result["street"] = street
        result["suburb"] = suburb
        result["state"] = state
        result["postcode"] = postcode

    # ---------------------------
    # 4. 提取房间信息：包含 Beds, Bath, Parking 的行
    room_line = ""
    room_index = None
    for i, line in enumerate(lines):
        if "Bed" in line and "Bath" in line and "Parking" in line:
            room_line = line
            room_index = i
            break
    if room_line:
        # 提取床位数（例如 "3 Beds" 或 "1 Bed"）
        m_beds = re.search(r'(\d+)\s*Beds?', room_line, re.IGNORECASE)
        if m_beds:
            result["bedrooms"] = m_beds.group(1)
        # 提取卫浴数（例如 "1 Bath" 或 "2 Baths"）
        m_baths = re.search(r'(\d+)\s*Baths?', room_line, re.IGNORECASE)
        if m_baths:
            result["bathrooms"] = m_baths.group(1)
        # 提取车位数（例如 "9 Parking"）
        m_parking = re.search(r'(\d+)\s*Parking', room_line, re.IGNORECASE)
        if m_parking:
            result["parkingSpaces"] = m_parking.group(1)
    
    # ---------------------------
    # 5. 提取房源类型：取房间信息所在行下一行为候选行
    property_type = ""
    if room_index is not None and room_index + 1 < len(lines):
        candidate = lines[room_index + 1].strip()
        # 如果候选行中包含 "inspection"（不区分大小写），则认为不属于房源类型，置为空
        if "inspection" in candidate.lower():
            property_type = ""
        else:
            property_type = candidate
    result["propertyType"] = property_type
    
    return result

def parse_file(filename):
    """
    读取文件，按房源条目拆分并解析每个条目
    返回包含所有房源数据的列表
    """
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 假设每个房源条目以 "*   " 开头拆分（根据实际文件格式调整正则）
    entries = re.split(r'\n\*\s+', content)
    entries = [entry for entry in entries if entry.strip()]
    
    results = []
    for entry in entries:
        parsed = parse_property(entry)
        # 如果解析到了街道信息，则认为是有效数据
        if parsed["street"]:
            results.append(parsed)
    return results

if __name__ == '__main__':
    # 利用 glob 遍历当前目录下所有 .txt 文件
    txt_files = glob.glob("*.txt")
    all_data = []
    for filename in txt_files:
        print(f"正在解析文件：{filename}")
        data = parse_file(filename)
        all_data.extend(data)
    # 将所有房源数据写入一个 JSON 文件中
    with open('parsed_properties.json', 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    print(f"解析完成，共提取 {len(all_data)} 条房源数据，结果保存为 parsed_properties.json")
