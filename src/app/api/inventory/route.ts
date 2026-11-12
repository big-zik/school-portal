import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// GET /api/inventory — query inventory items & stock levels
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const logs = await prisma.auditLog.findMany({
      where: { module: 'INVENTORY' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const items = logs.map((l) => {
      const data = (l.newValue as any) || {}
      return {
        id: l.id,
        sku: data.sku || 'SKU-001',
        name: data.name || l.action,
        category: data.category || 'UNIFORMS',
        quantity: data.quantity || 0,
        unitCostKobo: data.unitCostKobo || 0,
        reorderLevel: data.reorderLevel || 10,
        supplier: data.supplier || 'N/A',
        lastRestocked: data.lastRestocked || l.createdAt,
      }
    })

    return NextResponse.json<ApiResponse>({ success: true, data: items })
  } catch (error: any) {
    console.error('GET /api/inventory error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/inventory — add new item or record stock replenishment
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sku, name, category, quantity, unitCost, reorderLevel, supplier } = body

    if (!sku || !name || !category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'sku, name, and category are required' },
        { status: 400 },
      )
    }

    const payload = {
      sku,
      name,
      category,
      quantity: Number(quantity) || 0,
      unitCostKobo: Math.round((Number(unitCost) || 0) * 100),
      reorderLevel: Number(reorderLevel) || 10,
      supplier: supplier || 'School Store Vendor',
      lastRestocked: new Date().toISOString(),
    }

    const log = await logAudit({
      userId: session.user.id,
      action: 'UPDATE_INVENTORY_STOCK',
      module: 'INVENTORY',
      entityType: 'StoreInventoryItem',
      newValue: payload,
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Inventory item recorded successfully', data: { id: log?.id || `inv_${Date.now()}`, ...payload } },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/inventory error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
