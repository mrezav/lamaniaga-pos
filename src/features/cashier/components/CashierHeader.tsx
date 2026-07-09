import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { User, ChevronRight, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Sesuaikan dengan path project Anda
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Sesuaikan path komponen Anda
import { LogOut, Settings } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { ProfileRow } from "@/db/schema";

interface Props {
    profile: ProfileRow;
}
export default function CashierHeader({ profile }: Props) {
    const params = useParams();
    const storeSlug = params?.storeSlug || "";
    const router = useRouter();

    const logoutMutation = useLogout();
    const handleLogout = async () => {
        try {
            const response = await logoutMutation.mutateAsync();
            if (response.success) {
                router.push("/login");
                router.refresh();
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Mengubah slug menjadi teks yang rapi (contoh: "toko-baju" -> "Toko Baju")
    const storeName =
        typeof storeSlug === "string"
            ? storeSlug
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
            : "Store";

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-6 shrink-0 shadow-sm">
            {/* SISI KIRI: Breadcrumb Navigasi & Nama Toko */}
            <div className="flex items-center gap-3 text-sm">
                {/* Link utama ke Dashboard */}
                <Link
                    href={`/stores/${storeSlug}/dashboard`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary font-medium transition-colors group"
                >
                    <Store className="h-4 w-4 text-muted-foreground/80 group-hover:text-primary" />
                    <span>Dashboard</span>
                </Link>

                {/* Separator / Panah */}
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />

                {/* Posisi sekarang (Arena Kasir) */}
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground bg-accent/60 px-2.5 py-1 rounded-md">
                        <span className="text-emerald-500 font-bold">Toko</span>{" "}
                        {storeName}
                    </span>
                </div>
            </div>

            {/* SISI KANAN: Murni Informasi Kasir Aktif */}
            <div className="flex items-center gap-3">
                {/* SISI TEKS */}
                <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-foreground leading-none">
                        <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 py-0.5 px-2 text-[10px] font-medium inline-flex items-center"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online
                        </Badge>
                        <span className="ml-2">{profile.fullName}</span>
                    </p>
                </div>

                {/* SISI AVATAR DENGAN DROPDOWN */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none cursor-pointer group">
                        <div className="relative">
                            {/* Avatar */}
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border text-muted-foreground shadow-sm group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                                <User className="h-4 w-4" />
                            </div>

                            {/* Indicator Dot untuk Mobile */}
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background md:hidden animate-pulse" />
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 mt-1">
                        {/* Label Informasi Kasir di Mobile */}
                        <DropdownMenuLabel className="block md:hidden font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {profile.fullName}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    Kasir Utama
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="block md:hidden" />

                        {/* Menu Item */}
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Pengaturan Akun</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            onClick={() => {
                                // Tambahkan fungsi logout Anda di sini (misal: signOut() dari NextAuth)
                                handleLogout();
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Keluar / Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
