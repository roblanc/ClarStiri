import { Link } from "react-router-dom";
import { Instagram, Youtube, Mail, ExternalLink, Radio } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Explorare",
      links: [
        { to: "/", label: "Feed Știri" },
        { to: "/surse", label: "Catalog Surse" },
        { to: "/tribuni", label: "Tribuni" },
      ],
    },
    {
      title: "Platformă",
      links: [
        { to: "/despre", label: "Despre Noi" },
        { to: "/metodologie", label: "Metodologie" },
        { to: "/contact", label: "Contact" },
      ],
    },
  ];

  const socials = [
    { 
      label: "Instagram", 
      icon: Instagram, 
      url: "https://www.instagram.com/thesite.ro/",
      handle: "@thesite.ro"
    },
    { 
      label: "TikTok", 
      icon: Radio, 
      url: "https://www.tiktok.com/@thesite.ro",
      handle: "@thesite.ro"
    },
  ];

  return (
    <footer className="bg-brand-green border-t border-black/10 mt-auto text-black">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <img
                src="/hero-illustration-headphones.webp"
                alt="ClarStiri Logo"
                className="h-10 w-auto"
              />
              <span className="font-serif italic text-2xl font-semibold text-black tracking-tight group-hover:opacity-80 transition-opacity">
                thesite.ro
              </span>
            </Link>
            <p className="text-sm text-black/70 max-w-sm leading-relaxed font-medium">
              Analizăm peisajul mediatic românesc prin date. Grupăm știrile pe subiecte și mapăm bias-ul politic, ca să poți vedea imaginea de ansamblu.
            </p>
            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-black/5 rounded-full text-black/60 hover:text-black hover:bg-black/10 transition-all border border-black/10"
                  title={social.label}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-black/60 hover:text-black transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
            © {currentYear} THESITE.RO — TOATE DREPTURILE REZERVATE
          </p>
          <div className="flex items-center gap-8">
             <a 
              href="mailto:contact@thesite.ro" 
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 hover:text-black transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> contact@thesite.ro
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
