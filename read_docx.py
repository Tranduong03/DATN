import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_docx(docx_path):
    with zipfile.ZipFile(docx_path) as docx:
        xml_content = docx.read('word/document.xml')
    
    tree = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text = []
    for paragraph in tree.iterfind('.//w:p', ns):
        texts = [node.text for node in paragraph.iterfind('.//w:t', ns) if node.text]
        if texts:
            text.append(''.join(texts))
    return '\n'.join(text)

try:
    path = "D:\\IT\\HK2_Y4\\DATN\\Document\\ĐẶC TẢ HỆ THỐNG CHỨC NĂNG CHUYỂN ĐỔI SANG CHẾ ĐỘ CHỦ SÂN.docx"
    with open("docx_output.txt", "w", encoding="utf-8") as f:
        f.write(extract_text_from_docx(path))
    print("Success")
except Exception as e:
    print("Error:", str(e))
