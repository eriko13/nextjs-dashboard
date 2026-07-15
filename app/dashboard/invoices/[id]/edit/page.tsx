import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import postgres from 'postgres';
import { Metadata } from 'next';

const sql = postgres(process.env.POSTGRES_URL!);

export const metadata: Metadata = {
  title: 'Edit Invoice',
};

export async function generateStaticParams() {
  const invoices = await sql<{ id: string }[]>`SELECT id FROM invoices`;
  return invoices.map((invoice) => ({ id: invoice.id }));
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <EditInvoiceForm id={id} />
      </Suspense>
    </main>
  );
}

async function EditInvoiceForm({ id }: { id: string }) {
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!invoice) {
    notFound();
  }

  return <Form invoice={invoice} customers={customers} />;
}
