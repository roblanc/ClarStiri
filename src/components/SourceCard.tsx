interface SourceCardProps {
  source: {
    name: string;
    location: string;
    headline: string;
    image?: string;
    logo?: string;
  };
  bias: 'left' | 'center' | 'right';
}

const biasColors = {
  left: 'border-l-bias-left',
  center: 'border-l-bias-center',
  right: 'border-l-bias-right',
};

export function SourceCard({ source, bias }: SourceCardProps) {
  return (
    <article className={`bg-card rounded-lg border border-border/50 overflow-hidden border-l-4 ${biasColors[bias]}`}>
      {source.image && (
        <img
          src={source.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {source.logo && (
            <img src={source.logo} alt="" loading="lazy" decoding="async" className="w-5 h-5 rounded-full" />
          )}
          <div>
            <span className="text-sm font-medium text-card-foreground">{source.name}</span>
            <span className="text-xs text-muted-foreground ml-1">· {source.location}</span>
          </div>
        </div>
        <h4 className="text-sm leading-snug text-card-foreground line-clamp-3">
          {source.headline}
        </h4>
      </div>
    </article>
  );
}
