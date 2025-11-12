base_url = "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi"
extension = ".jpeg"
start_num = 1
end_num = 1092
output_filename = "urls_with_comma.txt"

urls_list = []
for i in range(start_num, end_num + 1):
    # URLを生成
    url = f"{base_url}{i}{extension}"
    
    # 最後の番号でなければカンマを付ける
    if i < end_num:
        urls_list.append(url + ",")
    else:
        urls_list.append(url)

# ファイルに書き出す（各URLは改行で区切る）
with open(output_filename, "w") as f:
    f.write("\n".join(urls_list))

print(f"{len(urls_list)}個のURLを '{output_filename}' に生成しました。")