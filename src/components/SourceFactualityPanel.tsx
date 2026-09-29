import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  describeEvidence,
  FACTUALITY_LABELS,
  FACTUALITY_RULE_UPDATED,
  FACTUALITY_RULE_VERSION,
  factualityPillClass,
  getFactuality,
} from '@/data/sourceFactuality';

export function SourceFactualityPanel({ sourceId }: { sourceId: string }) {
  const { rating, reason, evidence } = getFactuality(sourceId);

  return (
    <section className="surface-panel rounded-[1.75rem] p-5 space-y-4" aria-labelledby="factualitate-heading">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="factualitate-heading" className="text-base font-semibold text-foreground">
          Factualitate: ce spun datele publice
        </h3>
        <span className={`px-2.5 py-1 text-xs rounded-full border ${factualityPillClass[rating]}`}>
          {FACTUALITY_LABELS[rating]}
        </span>
      </header>

      <p className="text-sm text-muted-foreground">{reason}</p>

      {evidence.length > 0 && (
        <ul className="space-y-2">
          {evidence.map((item) => (
            <li key={`${item.kind}-${item.url}`} className="text-sm leading-relaxed">
              <span className="text-foreground">{describeEvidence(item)}</span>{' '}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Sursa: {item.publisher}
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-muted-foreground"> · verificat {item.checkedAt}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Eticheta rezultă automat din date publice (regula {FACTUALITY_RULE_VERSION}, actualizată {FACTUALITY_RULE_UPDATED}) și nu
        reprezintă o opinie editorială thesite.ro. Detalii în{' '}
        <Link to="/metodologie#factualitate" className="text-primary hover:underline">
          metodologie
        </Link>
        . Reprezentați această publicație și aveți o corecție?{' '}
        <Link to="/contact" className="text-primary hover:underline">
          Scrieți-ne
        </Link>
        .
      </p>
    </section>
  );
}
