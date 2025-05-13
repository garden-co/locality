'use client';

import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';

export default function HeaderOptions() {
   return (
      <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
         <Button size="xs" variant="ghost">
            <ListFilter className="size-4 mr-1" />
            Filter
         </Button>
      </div>
   );
}
