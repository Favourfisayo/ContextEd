import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Session } from "@/lib/auth-client";

interface UserAvatarProps {
    user: Session["user"],
    fallbackImage: string | undefined
}

export default function UserAvatar({user, fallbackImage}: UserAvatarProps) {
return (
    <>
    <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
        <AvatarFallback className="rounded-lg">{fallbackImage}</AvatarFallback>
    </Avatar>
    </>
)
}