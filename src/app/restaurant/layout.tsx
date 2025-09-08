import React from 'react';

interface RestaurantLayoutProps {
  children: React.ReactNode;
}

export default function RestaurantLayout({ children }: RestaurantLayoutProps) {
  return (
    <div className="restaurant-layout">
      {children}
    </div>
  );
}

export const metadata = {
  title: 'Restaurante | SmartCard',
  description: 'Explore o cardápio e faça seu pedido',
};
