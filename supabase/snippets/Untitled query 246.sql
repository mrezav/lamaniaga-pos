-- 1. Hapus policy yang bermasalah (permissive DELETE)
DROP POLICY IF EXISTS "Owners can delete store members" ON public.store_members;

-- 2. Buat ulang policy DELETE dengan pembatasan yang benar
CREATE POLICY "Owners can delete store members"
ON public.store_members
FOR DELETE
TO authenticated
USING (store_id IN (SELECT public.owned_store_ids()));