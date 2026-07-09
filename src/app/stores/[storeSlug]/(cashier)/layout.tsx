import React from "react";

export default function CashierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Kita buat container utama yang mematikan scroll body
        // agar aplikasi kasir terasa seperti aplikasi desktop/native
        <div className="h-screen w-screen overflow-hidden bg-background">
            {/* 
         Kamu bisa menambahkan Navbar tipis khusus kasir di sini 
         jika ingin menampilkan nama kasir atau jam secara global 
      */}
            <main className="h-full w-full">{children}</main>
        </div>
    );
}
