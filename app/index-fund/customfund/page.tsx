"use client";

import CreateFundForm from '@/components/index-fund/CreateFundForm';

export default function CreateFundPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Index Fund</h1>
        <CreateFundForm redirectPath="/index-fund/page" />
      </div>
    </div>
  );
}