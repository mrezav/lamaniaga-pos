-- Aktifkan RLS pada bucket storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Buat kebijakan untuk mengizinkan semua pengguna terautentikasi untuk mengunggah (INSERT) file
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'stores' AND auth.role() = 'authenticated');

-- Buat kebijakan untuk mengizinkan semua pengguna terautentikasi untuk melihat (SELECT) file (opsional, jika file bersifat publik)
CREATE POLICY "Allow authenticated users to view files" ON storage.objects
FOR SELECT USING (bucket_id = 'stores' AND auth.role() = 'authenticated');

-- Buat kebijakan untuk mengizinkan semua pengguna terautentikasi untuk menghapus (DELETE) file mereka sendiri (opsional, jika diperlukan)
CREATE POLICY "Allow authenticated users to delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'stores' AND auth.uid() = owner);

-- Buat kebijakan untuk mengizinkan semua pengguna terautentikasi untuk memperbarui (UPDATE) file mereka sendiri (opsional, jika diperlukan)
CREATE POLICY "Allow authenticated users to update their own files" ON storage.objects
FOR UPDATE USING (bucket_id = 'stores' AND auth.uid() = owner);
