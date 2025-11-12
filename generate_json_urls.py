# --- 設定項目 ---
# ベースとなるURLの、番号の前の部分
base_url = "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_main"

# 拡張子
extension = ".jpeg"

# 生成する番号の範囲
start_num = 1  # 変更点：開始番号を1にしました
end_num = 73

# 保存するファイル名
output_filename = "urls_for_json.txt"
# --- 設定はここまで ---


# 結果を格納するためのリスト
json_formatted_urls = []

# 指定された範囲でループ
for i in range(start_num, end_num + 1):
    # URLを組み立て
    url = f"{base_url}{i}{extension}"
    
    # JSONで使える形式にフォーマット
    # 最後の番号でなければ末尾にカンマを付ける
    if i < end_num:
        formatted_string = f'  "{url}",'
    else:
        # 最後の番号の場合はカンマを付けない
        formatted_string = f'  "{url}"'
        
    json_formatted_urls.append(formatted_string)

# ファイルに書き出す
with open(output_filename, "w") as f:
    # リストの各要素を改行でつないで書き込み
    f.write("\n".join(json_formatted_urls))

print(f"JSON形式のURLリストを '{output_filename}' に生成しました。")