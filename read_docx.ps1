Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("D:\IT\HK2_Y4\DATN\Document\ĐẶC TẢ HỆ THỐNG CHỨC NĂNG CHUYỂN ĐỔI SANG CHẾ ĐỘ CHỦ SÂN.docx")
$entry = $zip.GetEntry("word/document.xml")
$reader = New-Object System.IO.StreamReader($entry.Open())
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
$text = $xml -replace '<[^>]+>', ' ' -replace '\s+', ' '
Out-File -FilePath "docx_output.txt" -InputObject $text -Encoding utf8
