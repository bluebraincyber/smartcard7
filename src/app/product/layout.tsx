import React from 'react';

interface ProductLayoutProps {
  children: React.ReactNode;
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return (
    <div className="product-layout">
      {children}
    </div>
  );
}

export const metadata = {
  title: 'Produto | SmartCard',
  description: 'Detalhes do produto e customizações',
};
