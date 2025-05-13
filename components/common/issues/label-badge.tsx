import { Badge } from '@/components/ui/badge';
import { LabelList } from '@/lib/jazz-schema';

export function LabelBadge({ labels }: { labels: LabelList }) {
   return (
      <>
         {labels.map((l, index) => (
            <Badge
               key={l?.id ?? l?.name ?? index}
               variant="outline"
               className="gap-1.5 rounded-full text-muted-foreground bg-background"
            >
               <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: l?.color }}
                  aria-hidden="true"
               ></span>
               {l?.name}
            </Badge>
         ))}
      </>
   );
}
