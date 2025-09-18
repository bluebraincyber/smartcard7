# Onboarding Module

This module handles the initial setup and configuration of a new store in the SmartCard platform. It guides users through a series of steps to configure their store settings, products, and other essential information.

## Components

### OnboardingContainer

A wrapper component that manages the overall onboarding flow state and UI.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| steps | `WizardStep[]` | Yes | - | Array of steps to display in the wizard |
| onComplete | `() => Promise<void> \| void` | Yes | - | Callback when onboarding is completed |
| onCancel | `() => void` | No | - | Callback when user cancels onboarding |
| storageKey | `string` | No | 'onboarding_progress' | Key for localStorage to persist progress |
| title | `string` | No | 'Configuração Inicial' | Title displayed at the top of the wizard |
| description | `string` | No | 'Vamos configurar sua conta...' | Description displayed below the title |

#### Example

```tsx
<OnboardingContainer
  steps={steps}
  onComplete={handleComplete}
  onCancel={handleCancel}
  title="Configure sua loja"
  description="Vamos configurar sua loja para começar a vender."
/>
```

### OnboardingWizard

Handles the step-by-step navigation and progress tracking.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| steps | `WizardStep[]` | Yes | - | Array of steps to display |
| onComplete | `() => void` | Yes | - | Callback when wizard is completed |
| onCancel | `() => void` | Yes | - | Callback when wizard is cancelled |
| storageKey | `string` | No | 'onboarding_progress' | Key for localStorage |

#### WizardStep Interface

```typescript
interface WizardStep {
  id: string;          // Unique identifier for the step
  title: string;       // Step title
  description?: string; // Optional step description
  component: ReactNode; // The component to render for this step
  validate?: () => boolean; // Optional validation function
}
```

## Usage Example

```tsx
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { WizardStep } from '@/components/onboarding/OnboardingWizard';

const steps: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo',
    description: 'Vamos configurar sua conta',
    component: <WelcomeStep />,
  },
  // ... more steps
];

export default function OnboardingPage() {
  const handleComplete = async () => {
    // Handle completion
  };

  const handleCancel = () => {
    // Handle cancellation
  };

  return (
    <OnboardingContainer
      steps={steps}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
```

## State Management

The onboarding flow automatically saves progress to localStorage using the provided `storageKey`. This allows users to continue where they left off if they navigate away and return later.

## Styling

Components are styled using Tailwind CSS. Customize the appearance by:

1. Adding custom classes via the `className` prop
2. Overriding styles in your global CSS file
3. Using the theme configuration in `tailwind.config.js`

## Testing

When testing components that use the OnboardingContainer or OnboardingWizard, make sure to mock the localStorage API and any async operations.

## Accessibility

The components include proper ARIA attributes and keyboard navigation. Ensure any custom steps maintain these standards.
