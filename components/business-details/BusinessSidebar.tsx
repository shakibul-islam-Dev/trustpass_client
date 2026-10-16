import { Globe, Mail, Phone, ExternalLink } from 'lucide-react';
import type { IBusiness } from '@/types/business';

const formatLabel = (value: string) =>
  value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function BusinessContactInfo({ business }: { business: IBusiness }) {
  const contactItems = [
    { href: business.contactPhone ? `tel:${business.contactPhone}` : null, icon: Phone, title: 'Call', value: business.contactPhone },
    { href: business.contactEmail ? `mailto:${business.contactEmail}` : null, icon: Mail, title: 'Email', value: business.contactEmail },
    { href: business.websiteUrl, icon: Globe, title: 'Website', value: business.websiteUrl?.replace(/^https?:\/\//, '') },
  ].filter((item) => Boolean(item.href));

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Direct Contact
      </h3>
      
      <div className="space-y-2">
        {contactItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <a
              key={idx}
              href={item.href!}
              target={item.href?.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-border transition text-xs font-medium text-foreground group"
            >
              <span className="flex items-center gap-2.5 truncate">
                <Icon className="size-4 text-primary shrink-0" />
                <span className="truncate">{item.value}</span>
              </span>
              <ExternalLink className="size-3 text-muted-foreground opacity-60 group-hover:opacity-100" />
            </a>
          );
        })}
        {contactItems.length === 0 && (
          <p className="text-xs text-muted-foreground">No public contacts provided.</p>
        )}
      </div>
    </div>
  );
}

export function BusinessOverview({
  business,
  hasScore,
  trustScore,
}: {
  business: IBusiness;
  hasScore: boolean;
  trustScore: number;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Summary
      </h3>
      <dl className="divide-y divide-border/50 text-xs">
        <div className="flex justify-between py-2.5">
          <dt className="text-muted-foreground">Business Structure</dt>
          <dd className="font-semibold text-foreground">{formatLabel(business.businessType)}</dd>
        </div>
        <div className="flex justify-between py-2.5">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatLabel(business.verificationStatus)}
          </dd>
        </div>
        <div className="flex justify-between py-2.5">
          <dt className="text-muted-foreground">Trust Rating</dt>
          <dd className="font-bold text-foreground">
            {hasScore ? `${trustScore} / 100` : 'Not Scored'}
          </dd>
        </div>
      </dl>
    </div>
  );
}