import type { Meta, StoryObj } from '@storybook/react';
import { FormField, FormInput, FormTextarea, FormSelect } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const meta: Meta<typeof FormField> = {
  title: 'Forms/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable form field component with label, description, and error states.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <FormField label="Default Field">
        <Input placeholder="Type something..." />
      </FormField>
      
      <FormField 
        label="With Description"
        description="This is a helpful description for the field"
      >
        <Input placeholder="Type something..." />
      </FormField>
      
      <FormField 
        label="Required Field"
        description="This field is required"
        required
      >
        <Input placeholder="This field is required" required />
      </FormField>
      
      <FormField 
        label="With Error"
        error={{ message: 'This field is required', type: 'required' }}
      >
        <Input className="border-destructive" placeholder="Error state" />
      </FormField>
    </div>
  ),
};

export const FormInputExample: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState<{ message: string } | undefined>();

    const validateEmail = (email: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!value) {
        setError({ message: 'Email is required' });
      } else if (!validateEmail(value)) {
        setError({ message: 'Please enter a valid email' });
      } else {
        setError(undefined);
        alert(`Subscribed with: ${value}`);
        setValue('');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="w-[400px] space-y-4">
        <h2 className="text-xl font-bold">Subscribe to our newsletter</h2>
        <p className="text-muted-foreground">Stay updated with our latest news and offers</p>
        
        <FormInput
          label="Email"
          placeholder="your@email.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={error}
          required
        />
        
        <Button type="submit">Subscribe</Button>
      </form>
    );
  },
};

export const FormTextareaExample: Story = {
  render: () => {
    const [bio, setBio] = useState('');
    
    return (
      <div className="w-[500px] space-y-4">
        <h2 className="text-xl font-bold">Profile Information</h2>
        
        <FormInput
          label="Full Name"
          placeholder="John Doe"
          className="w-full"
        />
        
        <FormTextarea
          label="Bio"
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          description="Maximum 500 characters"
        />
        
        <div className="text-sm text-muted-foreground text-right">
          {bio.length}/500 characters
        </div>
      </div>
    );
  },
};

export const FormSelectExample: Story = {
  render: () => {
    const countries = [
      { value: 'br', label: 'Brazil' },
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'au', label: 'Australia' },
    ];
    
    const [selectedCountry, setSelectedCountry] = useState('');
    
    return (
      <div className="w-[400px] space-y-6">
        <h2 className="text-xl font-bold">Shipping Information</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="First Name" placeholder="John" />
          <FormInput label="Last Name" placeholder="Doe" />
        </div>
        
        <FormInput label="Email" placeholder="your@email.com" type="email" />
        
        <FormSelect
          label="Country/Region"
          options={countries}
          value={selectedCountry}
          onValueChange={setSelectedCountry}
          placeholder="Select a country"
        />
        
        <FormInput label="Address" placeholder="123 Main St" />
        
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="City" placeholder="New York" />
          <FormInput label="ZIP/Postal Code" placeholder="10001" />
        </div>
        
        <Button className="w-full">Continue to Shipping</Button>
      </div>
    );
  },
};

export const FormValidationExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        alert('Form submitted successfully!');
        // Submit form
      }
    };
    
    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };
    
    return (
      <form onSubmit={handleSubmit} className="w-[400px] space-y-4">
        <h2 className="text-xl font-bold mb-4">Create an Account</h2>
        
        <FormInput
          label="Username"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          error={errors.username ? { message: errors.username } : undefined}
          required
        />
        
        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email ? { message: errors.email } : undefined}
          required
        />
        
        <FormInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password ? { message: errors.password } : undefined}
          required
        />
        
        <FormInput
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword ? { message: errors.confirmPassword } : undefined}
          required
        />
        
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    );
  },
};
