import { redirect } from 'next/navigation'

export default function CategoriesPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/store/${params.id}`)
}
