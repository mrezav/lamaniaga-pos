
  create policy "Allow all access to authenticated and service_role 1qcqrtz_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated, service_role
using ((bucket_id = 'public-assets'::text));



  create policy "Allow all access to authenticated and service_role 1qcqrtz_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated, service_role
with check ((bucket_id = 'public-assets'::text));



  create policy "Allow all access to authenticated and service_role 1qcqrtz_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated, service_role
using ((bucket_id = 'public-assets'::text));



  create policy "Allow all access to authenticated and service_role 1qcqrtz_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated, service_role
using ((bucket_id = 'public-assets'::text));



  create policy "Allow all users to Select File 1qcqrtz_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'public-assets'::text));



  create policy "Allow authenticated to select 10l6q6l_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'private-assets'::text));



  create policy "Allow service_role to all action 10l6q6l_0"
  on "storage"."objects"
  as permissive
  for select
  to service_role
using ((bucket_id = 'private-assets'::text));



  create policy "Allow service_role to all action 10l6q6l_1"
  on "storage"."objects"
  as permissive
  for insert
  to service_role
with check ((bucket_id = 'private-assets'::text));



  create policy "Allow service_role to all action 10l6q6l_2"
  on "storage"."objects"
  as permissive
  for update
  to service_role
using ((bucket_id = 'private-assets'::text));



  create policy "Allow service_role to all action 10l6q6l_3"
  on "storage"."objects"
  as permissive
  for delete
  to service_role
using ((bucket_id = 'private-assets'::text));



