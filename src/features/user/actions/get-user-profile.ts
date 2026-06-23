import { findUserProfile } from "../repositories";

export async function getUserProfileAction(userId: string) {
    try {
        const profiles = await findUserProfile(userId);
        if (!profiles) {
            return { success: false };
        }
        return { success: true, data: profiles };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan internal",
        };
    }
}
