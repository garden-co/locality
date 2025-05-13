'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/lib/jazz-schema';
import { getInitials } from '@/lib/utils';
import { useGetPresence } from '@/hooks/use-get-presence';

interface UserAvatarProps {
   user: UserProfile;
   className?: string;
   showStatus?: boolean;
}

export default function UserAvatar({ user, className, showStatus = false }: UserAvatarProps) {
   const status = useGetPresence(user?.id);

   return (
      <div className="relative">
         <Avatar className={className}>
            <AvatarImage src={user?.avatarUrl || ''} alt={user?.name} />
            <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
         </Avatar>

         {showStatus && (
            <span
               className={`absolute bottom-0 right-0 rounded-full w-2.5 h-2.5 border-2 border-white ${
                  status === 'online'
                     ? 'bg-green-500'
                     : status === 'away'
                       ? 'bg-yellow-500'
                       : 'bg-gray-400'
               }`}
            />
         )}
      </div>
   );
}
