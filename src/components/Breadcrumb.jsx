import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-0">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs sm:text-[13px] text-neutral-500 font-medium">
        <li>
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-neutral-950 transition-colors"
            title="CampusCorpo Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-neutral-400" />
              {isLast ? (
                <span className="text-neutral-950 font-semibold" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  to={item.href || '#'} 
                  className="hover:text-neutral-950 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

