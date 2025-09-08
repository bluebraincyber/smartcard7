export interface TemplateData {
  categories: {
    name: string;
    description?: string;
    items: {
      name: string;
      description?: string;
      price?: number;
    }[];
  }[];
  storeConfig: {
    requiresAddress: boolean;
    businessType: string;
    primaryColor: string;
  };
}

export const businessTemplates: Record<string, TemplateData> = {
  barbearia: {
    categories: [
      {
        name: "Cortes",
        description: "Cortes masculinos e femininos",
        items: [
          { name: "Corte Masculino", description: "Corte tradicional", price: 25 },
          { name: "Corte Feminino", description: "Corte e escova", price: 40 },
          { name: "Corte Infantil", description: "Até 12 anos", price: 20 },
        ]
      },
      {
        name: "Barba",
        description: "Serviços de barba",
        items: [
          { name: "Barba Completa", description: "Aparar e modelar", price: 15 },
          { name: "Bigode", description: "Aparar bigode", price: 8 },
        ]
      }
    ],
    storeConfig: {
      requiresAddress: false,
      businessType: "servicos",
      primaryColor: "#8B4513"
    }
  },
  
  lanchonete: {
    categories: [
      {
        name: "Lanches",
        description: "Nossos deliciosos lanches",
        items: [
          { name: "X-Burger", description: "Pão, hambúrguer, queijo, alface, tomate", price: 18 },
          { name: "X-Bacon", description: "Pão, hambúrguer, bacon, queijo, alface, tomate", price: 22 },
          { name: "X-Tudo", description: "Pão, hambúrguer, bacon, queijo, ovo, alface, tomate", price: 28 },
          { name: "X-Salada", description: "Pão, hambúrguer, queijo, alface, tomate, milho", price: 20 },
          { name: "Misto Quente", description: "Pão de forma, presunto e queijo", price: 12 },
          { name: "Bauru", description: "Pão francês, presunto, queijo, tomate", price: 15 }
        ]
      },
      {
        name: "Porções",
        description: "Acompanhamentos e porções",
        items: [
          { name: "Batata Frita P", description: "Porção pequena", price: 10 },
          { name: "Batata Frita M", description: "Porção média", price: 15 },
          { name: "Batata Frita G", description: "Porção grande", price: 20 },
          { name: "Mandioca Frita", description: "Porção de mandioca", price: 12 },
          { name: "Pastéis (5 unid)", description: "Carne, queijo ou pizza", price: 18 }
        ]
      },
      {
        name: "Bebidas",
        description: "Refrigerantes, sucos e vitaminas",
        items: [
          { name: "Refrigerante Lata", description: "350ml - Coca, Guaraná, Fanta", price: 5 },
          { name: "Refrigerante 600ml", description: "Coca, Guaraná, Fanta", price: 8 },
          { name: "Suco Natural", description: "Laranja, limão, maracujá - 300ml", price: 8 },
          { name: "Vitamina", description: "Banana, morango, abacate - 400ml", price: 12 },
          { name: "Água Mineral", description: "500ml", price: 3 }
        ]
      },
      {
        name: "Doces",
        description: "Sobremesas e doces",
        items: [
          { name: "Açaí na Tigela P", description: "300ml com granola e banana", price: 12 },
          { name: "Açaí na Tigela M", description: "500ml com granola e frutas", price: 18 },
          { name: "Milk Shake", description: "Chocolate, morango ou baunilha", price: 15 },
          { name: "Sorvete", description: "2 bolas - diversos sabores", price: 8 }
        ]
      }
    ],
    storeConfig: {
      requiresAddress: true,
      businessType: "alimentacao",
      primaryColor: "#FF6B35"
    }
  },
  
  hamburgueria: {
    categories: [
      {
        name: "Hambúrgueres",
        description: "Nossos hambúrgueres artesanais",
        items: [
          { name: "X-Burger", description: "Hambúrguer, queijo, alface, tomate", price: 18 },
          { name: "X-Bacon", description: "Hambúrguer, bacon, queijo, alface, tomate", price: 22 },
          { name: "X-Tudo", description: "Hambúrguer completo", price: 28 },
        ]
      },
      {
        name: "Acompanhamentos",
        description: "Porções e acompanhamentos",
        items: [
          { name: "Batata Frita", description: "Porção individual", price: 12 },
          { name: "Onion Rings", description: "Anéis de cebola", price: 15 },
        ]
      },
      {
        name: "Bebidas",
        description: "Refrigerantes e sucos",
        items: [
          { name: "Refrigerante Lata", description: "350ml", price: 5 },
          { name: "Suco Natural", description: "300ml", price: 8 },
        ]
      }
    ],
    storeConfig: {
      requiresAddress: true,
      businessType: "alimentacao",
      primaryColor: "#FF6B35"
    }
  },
  
  doceria: {
    categories: [
      {
        name: "Bolos",
        description: "Bolos caseiros",
        items: [
          { name: "Bolo de Chocolate", description: "Fatia individual", price: 8 },
          { name: "Bolo de Cenoura", description: "Fatia individual", price: 7 },
          { name: "Bolo Inteiro", description: "Serve 8 pessoas", price: 45 },
        ]
      },
      {
        name: "Doces",
        description: "Docinhos e brigadeiros",
        items: [
          { name: "Brigadeiro", description: "Unidade", price: 3 },
          { name: "Beijinho", description: "Unidade", price: 3 },
          { name: "Trufa", description: "Unidade", price: 4 },
        ]
      }
    ],
    storeConfig: {
      requiresAddress: true,
      businessType: "alimentacao",
      primaryColor: "#FF69B4"
    }
  },
  
  salao: {
    categories: [
      {
        name: "Cabelo",
        description: "Serviços para cabelo",
        items: [
          { name: "Corte Feminino", description: "Corte e finalização", price: 50 },
          { name: "Escova", description: "Lavagem e escova", price: 35 },
          { name: "Hidratação", description: "Tratamento capilar", price: 40 },
        ]
      },
      {
        name: "Unhas",
        description: "Manicure e pedicure",
        items: [
          { name: "Manicure", description: "Esmaltação simples", price: 25 },
          { name: "Pedicure", description: "Esmaltação simples", price: 30 },
          { name: "Unha em Gel", description: "Alongamento", price: 60 },
        ]
      }
    ],
    storeConfig: {
      requiresAddress: false,
      businessType: "servicos",
      primaryColor: "#E91E63"
    }
  },
  
  geral: {
    categories: [
      {
        name: "Produtos",
        description: "Nossos produtos",
        items: [
          { name: "Produto 1", description: "Descrição do produto", price: 10 },
          { name: "Produto 2", description: "Descrição do produto", price: 15 },
        ]
      },
      {
        name: "Serviços",
        description: "Nossos serviços",
        items: [
          { name: "Serviço 1", description: "Descrição do serviço", price: 25 },
          { name: "Serviço 2", description: "Descrição do serviço", price: 35 },
        ]
      }
    ],
    storeConfig: {
      requiresAddress: false,
      businessType: "geral",
      primaryColor: "#3B82F6"
    }
  }
};

export function getTemplateByType(businessType: string): TemplateData {
  return businessTemplates[businessType] || businessTemplates.geral;
}

export function getAvailableTemplates() {
  return Object.keys(businessTemplates).map(key => ({
    id: key,
    name: getTemplateDisplayName(key),
    description: getTemplateDescription(key)
  }));
}

function getTemplateDisplayName(key: string): string {
  const names: Record<string, string> = {
    barbearia: "Barbearia",
    lanchonete: "Lanchonete",
    hamburgueria: "Hamburgueria",
    doceria: "Doceria",
    salao: "Salão de Beleza",
    geral: "Modelo Geral"
  };
  return names[key] || key;
}

function getTemplateDescription(key: string): string {
  const descriptions: Record<string, string> = {
    barbearia: "Ideal para barbearias e salões masculinos",
    lanchonete: "Lanches, porções, bebidas e sobremesas",
    hamburgueria: "Perfeito para lanchonetes e hamburguerias",
    doceria: "Ótimo para confeitarias e docerias",
    salao: "Ideal para salões de beleza e estética",
    geral: "Modelo flexível para qualquer tipo de negócio"
  };
  return descriptions[key] || "Modelo personalizado";
}
