import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

// Mock steps for the stories
const mockSteps = [
  {
    id: 'step-1',
    title: 'Informações Básicas',
    description: 'Preencha as informações básicas da sua loja',
    component: (
      <div className="space-y-4">
        <div>
          <Label htmlFor="storeName">Nome da Loja</Label>
          <Input id="storeName" placeholder="Minha Loja" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="contato@minhaloja.com" className="mt-1" />
        </div>
      </div>
    ),
  },
  {
    id: 'step-2',
    title: 'Configurações',
    description: 'Configure as preferências da sua loja',
    component: (
      <div className="space-y-4">
        <div>
          <Label htmlFor="currency">Moeda</Label>
          <select id="currency" className="w-full p-2 border rounded mt-1">
            <option value="BRL">Real (R$)</option>
            <option value="USD">Dólar (US$)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="timezone">Fuso Horário</Label>
          <select id="timezone" className="w-full p-2 border rounded mt-1">
            <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
            <option value="America/New_York">Nova Iorque (GMT-4)</option>
            <option value="Europe/Lisbon">Lisboa (GMT+1)</option>
          </select>
        </div>
      </div>
    ),
  },
  {
    id: 'step-3',
    title: 'Revisão',
    description: 'Revise as informações antes de finalizar',
    component: (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <h3 className="font-medium">Resumo da Configuração</h3>
          <p className="text-sm text-muted-foreground">Verifique se todas as informações estão corretas.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Nome da Loja:</span> Minha Loja</p>
          <p><span className="font-medium">E-mail:</span> contato@minhaloja.com</p>
          <p><span className="font-medium">Moeda:</span> Real (R$)</p>
          <p><span className="font-medium">Fuso Horário:</span> Brasília (GMT-3)</p>
        </div>
      </div>
    ),
  },
];

// Mock component for the default story
const OnboardingExample = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsCompleted(true);
    setIsLoading(false);
  };

  const handleCancel = () => {
    console.log('Onboarding cancelled');
  };

  if (isCompleted) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Configuração Concluída!</h2>
        <p className="text-muted-foreground mb-6">Sua loja está pronta para começar a vender.</p>
        <Button>Ir para o Painel</Button>
      </div>
    );
  }

  return (
    <OnboardingContainer
      steps={mockSteps}
      onComplete={handleComplete}
      onCancel={handleCancel}
      title="Configuração da Loja"
      description="Complete os passos para configurar sua loja"
    />
  );
};

const meta: Meta<typeof OnboardingContainer> = {
  title: 'Onboarding/OnboardingContainer',
  component: OnboardingExample,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A container component that manages the onboarding flow state and UI.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingContainer>;

export const Default: Story = {
  render: () => <OnboardingExample />,
};

export const WithCustomSteps: Story = {
  render: () => {
    const customSteps = [
      {
        id: 'custom-1',
        title: 'Etapa Personalizada',
        description: 'Esta é uma etapa personalizada',
        component: (
          <div className="p-4 bg-primary/10 rounded-lg">
            <p>Conteúdo personalizado da etapa</p>
          </div>
        ),
      },
      {
        id: 'custom-2',
        title: 'Outra Etapa',
        component: (
          <div className="p-4">
            <p>Mais conteúdo personalizado</p>
          </div>
        ),
      },
    ];

    return (
      <OnboardingContainer
        steps={customSteps}
        onComplete={() => console.log('Completed')}
        onCancel={() => console.log('Cancelled')}
        title="Fluxo Personalizado"
        description="Este é um exemplo de fluxo personalizado"
      />
    );
  },
};

// Story for OnboardingWizard directly
export const WizardOnly: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);
    
    const handleComplete = () => {
      console.log('Wizard completed');
    };
    
    const handleCancel = () => {
      console.log('Wizard cancelled');
    };

    return (
      <div className="w-[600px] border rounded-lg overflow-hidden">
        <OnboardingWizard
          steps={mockSteps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    );
  },
};
