'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Building,
  Loader2,
  X,
  Sparkles,
  Layers,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  quantity: number
  unitCostKobo: number
  reorderLevel: number
  supplier: string
  lastRestocked: string
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCat, setSelectedCat] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'UNIFORMS',
    quantity: 50,
    unitCost: 8500,
    reorderLevel: 15,
    supplier: 'Apex Apparel & Textiles',
  })

  const sampleItems: InventoryItem[] = [
    {
      id: 'inv-1',
      sku: 'UNI-SS-BLAZER-01',
      name: 'Official Navy Blue School Blazer (Senior Secondary)',
      category: 'UNIFORMS',
      quantity: 85,
      unitCostKobo: 1850000, // 18,500 NGN
      reorderLevel: 20,
      supplier: 'Crown Tailoring Mill',
      lastRestocked: new Date().toISOString(),
    },
    {
      id: 'inv-2',
      sku: 'UNI-PRI-SHIRT-02',
      name: 'White Monogrammed Oxford Shirt (Primary)',
      category: 'UNIFORMS',
      quantity: 12,
      unitCostKobo: 450000,
      reorderLevel: 25,
      supplier: 'Crown Tailoring Mill',
      lastRestocked: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'inv-3',
      sku: 'LAB-CHEM-ACID-01',
      name: 'Hydrochloric Acid (HCl 37% Analytical Grade - 2.5L)',
      category: 'LAB_EQUIPMENT',
      quantity: 6,
      unitCostKobo: 2200000,
      reorderLevel: 10,
      supplier: 'Sigma Scientific Ltd',
      lastRestocked: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'inv-4',
      sku: 'SPT-BALL-FB-01',
      name: 'Official FIFA Match Footballs (Size 5)',
      category: 'SPORTS_GEAR',
      quantity: 24,
      unitCostKobo: 1200000,
      reorderLevel: 8,
      supplier: 'Decathlon Nigeria',
      lastRestocked: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
  ]

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inventory')
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        setItems(json.data)
      } else {
        setItems(sampleItems)
      }
    } catch (err) {
      console.error(err)
      setItems(sampleItems)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({
          sku: '',
          name: '',
          category: 'UNIFORMS',
          quantity: 50,
          unitCost: 8500,
          reorderLevel: 15,
          supplier: 'Apex Apparel & Textiles',
        })
        fetchInventory()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to add item')
      }
    } catch (err: any) {
      alert(err.message || 'Error adding item')
    } finally {
      setSubmitting(false)
    }
  }

  const totalValuationKobo = items.reduce((acc, i) => acc + i.quantity * i.unitCostKobo, 0)
  const lowStockCount = items.filter((i) => i.quantity <= i.reorderLevel).length

  const filteredItems = items.filter((i) => {
    const matchCat = selectedCat === 'ALL' || i.category === selectedCat
    const matchSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-indigo-600" />
              School Stores & Central Inventory Registry
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Stock control for uniforms, textbooks, laboratory apparatus, sports gear, and stationery
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Stock Item
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Catalogued SKUs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{items.length} Items</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Total Inventory Value</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              ₦{(totalValuationKobo / 100).toLocaleString()}
            </p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount} Items</p>
            <span className="text-[10px] text-amber-600 font-medium">Below re-order threshold</span>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Stock Fulfillment Status</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">94.2%</p>
            <span className="text-[10px] text-gray-400">Stores operational</span>
          </Card>
        </div>

        {/* Filter and Table */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Category:</span>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5"
              >
                <option value="ALL">All Categories</option>
                <option value="UNIFORMS">School Uniforms</option>
                <option value="LAB_EQUIPMENT">Science Lab Apparatus</option>
                <option value="SPORTS_GEAR">Athletics & Sports Gear</option>
                <option value="TEXTBOOKS">Textbooks & Workbooks</option>
              </select>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search SKU or item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">SKU Code</TableHead>
                  <TableHead className="text-xs">Item Description</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-center">In Stock</TableHead>
                  <TableHead className="text-xs text-right">Unit Cost</TableHead>
                  <TableHead className="text-xs text-right">Total Valuation</TableHead>
                  <TableHead className="text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isLow = item.quantity <= item.reorderLevel

                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                      <TableCell className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {item.category.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs">
                        {item.quantity} Units
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        ₦{(item.unitCostKobo / 100).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-gray-900 dark:text-gray-100">
                        ₦{((item.quantity * item.unitCostKobo) / 100).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {isLow ? (
                          <Badge className="text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                            Reorder Alert
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Well Stocked
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal: Add Stock Item */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Add Stock Item to Inventory
                </CardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        SKU Identifier *
                      </label>
                      <Input
                        required
                        placeholder="e.g. UNI-SS-SKIRT-01"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                      >
                        <option value="UNIFORMS">School Uniforms</option>
                        <option value="LAB_EQUIPMENT">Science Lab Apparatus</option>
                        <option value="SPORTS_GEAR">Athletics & Sports Kits</option>
                        <option value="TEXTBOOKS">Textbooks & Study Material</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Item Description / Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Senior Secondary Pleated Navy Blue Skirt"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Quantity In Stock *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Unit Cost (NGN) *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        required
                        value={formData.unitCost}
                        onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Re-Order Alert Level
                      </label>
                      <Input
                        type="number"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Supplier / Manufacturer
                    </label>
                    <Input
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      size="sm"
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Add to Inventory
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
