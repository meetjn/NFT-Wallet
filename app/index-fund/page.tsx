"use client";

// app/index-fund/page.tsx
import { Card } from '@/components/ui/card';
import { IndexFundList } from "@/components/index-fund/IndexFundList";
// import CreateIndexFund from '@/components/index-fund/CreateIndexFund';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function IndexFundPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Crypto Index Funds</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Standard Index Funds</h2>
        <IndexFundList type="standard" />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Custom Index Funds</h2>
        <IndexFundList type="custom" />
      </div>

      <Link 
        href="/index-fund/customfund" 
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Create New Index Fund
      </Link>
    </div>
  );
}