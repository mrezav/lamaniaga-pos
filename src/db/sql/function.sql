CREATE OR REPLACE FUNCTION public.owned_store_ids()
RETURNS SETOF uuid AS $$
  SELECT store_id 
  FROM public.store_members 
  WHERE user_id = auth.uid() AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- Untuk kebutuhan store members get_user_store_ids_by_roles(ARRAY['owner'])
CREATE OR REPLACE FUNCTION public.get_user_store_ids_by_roles(allowed_roles text[])
RETURNS SETOF uuid AS $$
  SELECT store_id 
  FROM public.store_members 
  WHERE user_id = auth.uid() 
    AND status = 'active'
    AND role = ANY(allowed_roles);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- 1. Hapus policy lama
DROP POLICY IF EXISTS "Manage own variants" ON public.product_variants;

-- 2. Buat policy baru
CREATE POLICY "Manage own variants" ON public.product_variants
FOR ALL 
TO authenticated
USING (store_id IN (SELECT owned_store_ids()))
WITH CHECK (store_id IN (SELECT owned_store_ids()));

-- 1. Hapus policy lama yang terlalu terbuka (USING (true))
DROP POLICY IF EXISTS "Manage own products" ON public.products;

-- 2. Buat policy SELECT (Semua orang/pengguna dapat melihat produk)
--    (Abaikan bagian ini jika produk TIDAK boleh dilihat secara publik)
CREATE POLICY "Public products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- 3. Buat policy Perubahan Data (INSERT, UPDATE, DELETE) 
--    hanya untuk pemilik toko yang aktif
CREATE POLICY "Users can manage products in their stores" 
ON public.products 
FOR ALL 
TO authenticated
USING (store_id IN (SELECT public.owned_store_ids()))
WITH CHECK (store_id IN (SELECT public.owned_store_ids()));

-- 1. Hapus policy lama jika ada
DROP POLICY IF EXISTS "Owners can insert store members" ON public.store_members;
DROP POLICY IF EXISTS "Owners can update store members" ON public.store_members;
DROP POLICY IF EXISTS "Owners can delete store members" ON public.store_members;
DROP POLICY IF EXISTS "Manage store members policy" ON public.store_members;

-- 2. Buat policy ALL yang sudah disesuaikan dengan alur Pendaftaran Mandiri
CREATE POLICY "Manage store members policy"
ON public.store_members
FOR ALL
TO authenticated
USING (
  -- DIOPTIMASI: Menggunakan (SELECT auth.uid())
  user_id = (SELECT auth.uid()) 
  OR store_id IN (
    SELECT public.get_user_store_ids_by_roles(ARRAY['owner', 'manager'])
  )
)
WITH CHECK (
  -- DIOPTIMASI: Menggunakan (SELECT auth.uid())
  (user_id = (SELECT auth.uid()) AND status = 'pending')
  OR store_id IN (
    SELECT public.get_user_store_ids_by_roles(ARRAY['owner', 'manager'])
  )
);