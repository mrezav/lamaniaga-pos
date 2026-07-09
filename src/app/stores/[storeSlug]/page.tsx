import { redirect } from "next/navigation";
interface Props {
    params: Promise<{ storeSlug: string }>;
}
export default async function StorePage({ params }: Props) {
    const { storeSlug } = await params;
    redirect(`/stores/${storeSlug}/dashboard`);
}
