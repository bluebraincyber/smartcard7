import { toast } from '@/components/ui/use-toast'

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info'

export function useOnboardingToast() {
  const showToast = (
    title: string,
    description?: string,
    variant: ToastVariant = 'default'
  ) => {
    toast({
      title,
      description,
      variant,
    })
  }

  const showSuccess = (title: string, description?: string) => {
    showToast(title, description, 'success')
  }

  const showError = (title: string, description?: string) => {
    showToast(title, description, 'destructive')
  }

  const showWarning = (title: string, description?: string) => {
    showToast(title, description, 'warning')
  }

  const showInfo = (title: string, description?: string) => {
    showToast(title, description, 'info')
  }

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
