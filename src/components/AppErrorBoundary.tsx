import { Component, ErrorInfo, ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught app error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <div className="w-full max-w-xl border border-border bg-card p-8 text-center space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              ClarStiri
            </p>
            <h1 className="font-serif text-3xl">A apărut o eroare neașteptată</h1>
            <p className="text-muted-foreground">
              Pagina nu a putut fi afișată. Poți reîncărca sau reveni la prima pagină.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2 bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Reîncarcă pagina
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2 border border-border bg-background hover:bg-muted transition-colors"
              >
                Mergi la prima pagină
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
