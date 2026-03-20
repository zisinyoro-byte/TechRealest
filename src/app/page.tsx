'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Building2, Users, FileText, DollarSign, Wrench, BarChart3,
  HomeIcon, Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock,
  Phone, Mail, MapPin, Calendar, Bed, Bath, Square, Car,
  ChevronRight, X, Download, RefreshCw, Settings, Bell,
  LogOut, Menu, LayoutDashboard, Building, UserCheck,
  CreditCard, ClipboardList, Activity, Moon, Sun
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'

// Types
interface DashboardData {
  metrics: {
    totalProperties: number
    totalTenants: number
    activeLeases: number
    monthlyRevenue: number
    pendingPayments: number
    openMaintenance: number
    occupancyRate: number
  }
  revenueTrend: Array<{ month: string; revenue: number }>
  upcomingExpirations: Array<any>
  recentActivities: Array<any>
  paymentOverview: {
    collected: number
    pending: number
    overdue: number
  }
  propertyByType: Array<{ type: string; count: number }>
}

interface Property {
  id: string
  name: string
  description?: string
  type: string
  status: string
  address: string
  city: string
  state: string
  zipCode: string
  bedrooms: number
  bathrooms: number
  squareFeet?: number
  currentValue?: number
  amenities?: string
  _count?: { tenants: number; leases: number; maintenance: number }
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: string
  creditScore?: number
  backgroundCheckStatus: string
  property?: Property
  leases?: Array<{ monthlyRent: number }>
  _count?: { payments: number; maintenance: number }
}

interface Lease {
  id: string
  leaseNumber: string
  type: string
  status: string
  startDate: string
  endDate?: string
  monthlyRent: number
  securityDeposit: number
  property: Property
  tenant: Tenant
  _count?: { payments: number }
}

interface Payment {
  id: string
  paymentNumber: string
  type: string
  status: string
  amount: number
  totalAmount: number
  paymentMethod?: string
  paymentDate?: string
  dueDate: string
  tenant: Tenant
  lease: Lease
}

interface MaintenanceRequest {
  id: string
  requestNumber: string
  title: string
  description: string
  priority: string
  status: string
  category: string
  estimatedCost?: number
  actualCost?: number
  property: Property
  tenant?: Tenant
}

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    // Property status
    AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    OCCUPIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    FOR_SALE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    FOR_RENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    // Tenant status
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    FORMER: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    // Lease status
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    PENDING_SIGNATURE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    TERMINATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    RENEWED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    // Payment status
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    PARTIAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    // Maintenance status
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    ON_HOLD: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    // Priority
    LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    EMERGENCY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'EMERGENCY': return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'HIGH': return <TrendingUp className="h-4 w-4 text-orange-500" />
    case 'MEDIUM': return <Clock className="h-4 w-4 text-yellow-500" />
    case 'LOW': return <CheckCircle className="h-4 w-4 text-green-500" />
    default: return null
  }
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    PLUMBING: '🔧',
    ELECTRICAL: '⚡',
    HVAC: '❄️',
    APPLIANCE: '🧰',
    STRUCTURAL: '🏗️',
    LANDSCAPING: '🌳',
    PEST_CONTROL: '🐛',
    PAINTING: '🎨',
    GENERAL_REPAIR: '🔨',
    SAFETY: '🛡️',
    OTHER: '📋'
  }
  return icons[category] || '📋'
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function TechRealestApp() {
  // State
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([])

  // Filter states
  const [propertyFilter, setPropertyFilter] = useState({ status: 'ALL', type: 'ALL', search: '' })
  const [tenantFilter, setTenantFilter] = useState({ status: 'ALL', search: '' })
  const [leaseFilter, setLeaseFilter] = useState({ status: 'ALL', search: '' })
  const [paymentFilter, setPaymentFilter] = useState({ status: 'ALL', search: '' })
  const [maintenanceFilter, setMaintenanceFilter] = useState({ status: 'ALL', priority: 'ALL', search: '' })

  // Dialog states
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false)
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false)
  const [leaseDialogOpen, setLeaseDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSeeding, setIsSeeding] = useState(false)

  // Fetch functions
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setDashboard(data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    }
  }, [])

  const fetchProperties = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (propertyFilter.status !== 'ALL') params.append('status', propertyFilter.status)
      if (propertyFilter.type !== 'ALL') params.append('type', propertyFilter.type)
      if (propertyFilter.search) params.append('search', propertyFilter.search)
      const res = await fetch(`/api/properties?${params}`)
      const data = await res.json()
      setProperties(data)
    } catch (error) {
      toast.error('Failed to load properties')
    }
  }, [propertyFilter])

  const fetchTenants = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (tenantFilter.status !== 'ALL') params.append('status', tenantFilter.status)
      if (tenantFilter.search) params.append('search', tenantFilter.search)
      const res = await fetch(`/api/tenants?${params}`)
      const data = await res.json()
      setTenants(data)
    } catch (error) {
      toast.error('Failed to load tenants')
    }
  }, [tenantFilter])

  const fetchLeases = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (leaseFilter.status !== 'ALL') params.append('status', leaseFilter.status)
      if (leaseFilter.search) params.append('search', leaseFilter.search)
      const res = await fetch(`/api/leases?${params}`)
      const data = await res.json()
      setLeases(data)
    } catch (error) {
      toast.error('Failed to load leases')
    }
  }, [leaseFilter])

  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (paymentFilter.status !== 'ALL') params.append('status', paymentFilter.status)
      if (paymentFilter.search) params.append('search', paymentFilter.search)
      const res = await fetch(`/api/payments?${params}`)
      const data = await res.json()
      setPayments(data)
    } catch (error) {
      toast.error('Failed to load payments')
    }
  }, [paymentFilter])

  const fetchMaintenance = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (maintenanceFilter.status !== 'ALL') params.append('status', maintenanceFilter.status)
      if (maintenanceFilter.priority !== 'ALL') params.append('priority', maintenanceFilter.priority)
      if (maintenanceFilter.search) params.append('search', maintenanceFilter.search)
      const res = await fetch(`/api/maintenance?${params}`)
      const data = await res.json()
      setMaintenance(data)
    } catch (error) {
      toast.error('Failed to load maintenance requests')
    }
  }, [maintenanceFilter])

  const seedDatabase = async () => {
    setIsSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(`Database seeded! ${data.stats.properties} properties, ${data.stats.tenants} tenants`)
        fetchDashboard()
        fetchProperties()
        fetchTenants()
        fetchLeases()
        fetchPayments()
        fetchMaintenance()
      }
    } catch (error) {
      toast.error('Failed to seed database')
    } finally {
      setIsSeeding(false)
    }
  }

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchDashboard(),
        fetchProperties(),
        fetchTenants(),
        fetchLeases(),
        fetchPayments(),
        fetchMaintenance()
      ])
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Refresh on filter change
  useEffect(() => { if (!isLoading) fetchProperties() }, [propertyFilter, fetchProperties, isLoading])
  useEffect(() => { if (!isLoading) fetchTenants() }, [tenantFilter, fetchTenants, isLoading])
  useEffect(() => { if (!isLoading) fetchLeases() }, [leaseFilter, fetchLeases, isLoading])
  useEffect(() => { if (!isLoading) fetchPayments() }, [paymentFilter, fetchPayments, isLoading])
  useEffect(() => { if (!isLoading) fetchMaintenance() }, [maintenanceFilter, fetchMaintenance, isLoading])

  // CRUD handlers
  const handleSaveProperty = async (data: any) => {
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const url = editingItem ? `/api/properties/${editingItem.id}` : '/api/properties'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        toast.success(editingItem ? 'Property updated' : 'Property created')
        fetchProperties()
        fetchDashboard()
        setPropertyDialogOpen(false)
        setEditingItem(null)
      }
    } catch (error) {
      toast.error('Failed to save property')
    }
  }

  const handleDeleteProperty = async (id: string) => {
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Property deleted')
        fetchProperties()
        fetchDashboard()
      }
    } catch (error) {
      toast.error('Failed to delete property')
    }
  }

  const handleSaveTenant = async (data: any) => {
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const url = editingItem ? `/api/tenants/${editingItem.id}` : '/api/tenants'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        toast.success(editingItem ? 'Tenant updated' : 'Tenant created')
        fetchTenants()
        fetchDashboard()
        setTenantDialogOpen(false)
        setEditingItem(null)
      }
    } catch (error) {
      toast.error('Failed to save tenant')
    }
  }

  const handleDeleteTenant = async (id: string) => {
    try {
      const res = await fetch(`/api/tenants/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Tenant deleted')
        fetchTenants()
        fetchDashboard()
      }
    } catch (error) {
      toast.error('Failed to delete tenant')
    }
  }

  const handleSaveLease = async (data: any) => {
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const url = editingItem ? `/api/leases/${editingItem.id}` : '/api/leases'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        toast.success(editingItem ? 'Lease updated' : 'Lease created')
        fetchLeases()
        fetchDashboard()
        setLeaseDialogOpen(false)
        setEditingItem(null)
      }
    } catch (error) {
      toast.error('Failed to save lease')
    }
  }

  const handleSavePayment = async (data: any) => {
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const url = editingItem ? `/api/payments/${editingItem.id}` : '/api/payments'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        toast.success(editingItem ? 'Payment updated' : 'Payment recorded')
        fetchPayments()
        fetchDashboard()
        setPaymentDialogOpen(false)
        setEditingItem(null)
      }
    } catch (error) {
      toast.error('Failed to save payment')
    }
  }

  const handleSaveMaintenance = async (data: any) => {
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const url = editingItem ? `/api/maintenance/${editingItem.id}` : '/api/maintenance'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        toast.success(editingItem ? 'Request updated' : 'Request created')
        fetchMaintenance()
        fetchDashboard()
        setMaintenanceDialogOpen(false)
        setEditingItem(null)
      }
    } catch (error) {
      toast.error('Failed to save maintenance request')
    }
  }

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'leases', label: 'Leases', icon: FileText },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-emerald-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TechRealest</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">TechRealest</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                ${activeTab === item.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={seedDatabase}
            disabled={isSeeding}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isSeeding ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Seed Demo Data
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                JM
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">John Manager</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                  <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's your property overview.</p>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Properties</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard.metrics.totalProperties}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Building className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Tenants</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard.metrics.totalTenants}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(dashboard.metrics.monthlyRevenue)}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy Rate</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard.metrics.occupancyRate}%</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue over the past 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboard.revenueTrend}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                          <Tooltip
                            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                            contentStyle={{ borderRadius: '8px' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: '#10b981', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Overview</CardTitle>
                    <CardDescription>Collection status summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Collected', value: dashboard.paymentOverview.collected, color: '#10b981' },
                              { name: 'Pending', value: dashboard.paymentOverview.pending, color: '#f59e0b' },
                              { name: 'Overdue', value: dashboard.paymentOverview.overdue, color: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                          >
                            {[
                              { color: '#10b981' },
                              { color: '#f59e0b' },
                              { color: '#ef4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Collected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Expirations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Upcoming Expirations
                    </CardTitle>
                    <CardDescription>Leases expiring in the next 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {dashboard.upcomingExpirations.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No upcoming expirations</p>
                      ) : (
                        <div className="space-y-3">
                          {dashboard.upcomingExpirations.map((lease) => (
                            <div key={lease.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{lease.property.name}</p>
                                <p className="text-xs text-gray-500">{lease.tenant.firstName} {lease.tenant.lastName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-yellow-600">{formatDate(lease.endDate!)}</p>
                                <p className="text-xs text-gray-500">{lease.leaseNumber}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest actions in your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {dashboard.recentActivities.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
                      ) : (
                        <div className="space-y-3">
                          {dashboard.recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2" />
                              <div className="flex-1">
                                <p className="text-sm">{activity.description}</p>
                                <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Leases</span>
                      <Badge variant="secondary">{dashboard.metrics.activeLeases}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</span>
                      <Badge variant="secondary">{dashboard.metrics.pendingPayments}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Open Maintenance</span>
                      <Badge variant="secondary">{dashboard.metrics.openMaintenance}</Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Properties by Type</p>
                      {dashboard.propertyByType.map((item, index) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{item.type.replace('_', ' ')}</span>
                          <span className="text-xs font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
                  <p className="text-gray-500 dark:text-gray-400">Manage your real estate portfolio</p>
                </div>
                <Dialog open={propertyDialogOpen} onOpenChange={(open) => { setPropertyDialogOpen(open); if (!open) setEditingItem(null) }}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Property' : 'Add New Property'}</DialogTitle>
                      <DialogDescription>Enter the property details below</DialogDescription>
                    </DialogHeader>
                    <PropertyForm
                      property={editingItem}
                      onSave={handleSaveProperty}
                      onCancel={() => { setPropertyDialogOpen(false); setEditingItem(null) }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search properties..."
                    className="pl-10"
                    value={propertyFilter.search}
                    onChange={(e) => setPropertyFilter({ ...propertyFilter, search: e.target.value })}
                  />
                </div>
                <Select value={propertyFilter.status} onValueChange={(value) => setPropertyFilter({ ...propertyFilter, status: value })}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                    <SelectItem value="FOR_SALE">For Sale</SelectItem>
                    <SelectItem value="FOR_RENT">For Rent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={propertyFilter.type} onValueChange={(value) => setPropertyFilter({ ...propertyFilter, type: value })}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="SINGLE_FAMILY">Single Family</SelectItem>
                    <SelectItem value="MULTI_FAMILY">Multi Family</SelectItem>
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="CONDO">Condo</SelectItem>
                    <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                    <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Building className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No properties found</p>
                      <Button onClick={seedDatabase} variant="outline">Seed Demo Data</Button>
                    </CardContent>
                  </Card>
                ) : (
                  properties.map((property) => (
                    <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-40 bg-gradient-to-br from-emerald-400 to-emerald-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-white/50" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className={getStatusColor(property.status)}>
                            {property.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {property.address}, {property.city}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" /> {property.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4" /> {property.bathrooms}
                          </span>
                          {property.squareFeet && (
                            <span className="flex items-center gap-1">
                              <Square className="h-4 w-4" /> {property.squareFeet.toLocaleString()} ft²
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Current Value</p>
                            <p className="font-semibold text-emerald-600">
                              {property.currentValue ? formatCurrency(property.currentValue) : 'N/A'}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingItem(property); setPropertyDialogOpen(true) }}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete {property.name}. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDeleteProperty(property.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tenants Tab */}
          {activeTab === 'tenants' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1>
                  <p className="text-gray-500 dark:text-gray-400">Manage your tenants and applicants</p>
                </div>
                <Dialog open={tenantDialogOpen} onOpenChange={(open) => { setTenantDialogOpen(open); if (!open) setEditingItem(null) }}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tenant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
                      <DialogDescription>Enter the tenant details below</DialogDescription>
                    </DialogHeader>
                    <TenantForm
                      tenant={editingItem}
                      properties={properties}
                      onSave={handleSaveTenant}
                      onCancel={() => { setTenantDialogOpen(false); setEditingItem(null) }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tenants..."
                    className="pl-10"
                    value={tenantFilter.search}
                    onChange={(e) => setTenantFilter({ ...tenantFilter, search: e.target.value })}
                  />
                </div>
                <Select value={tenantFilter.status} onValueChange={(value) => setTenantFilter({ ...tenantFilter, status: value })}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="FORMER">Former</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tenants List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenants.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No tenants found</p>
                      <Button onClick={seedDatabase} variant="outline">Seed Demo Data</Button>
                    </CardContent>
                  </Card>
                ) : (
                  tenants.map((tenant) => (
                    <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                            {tenant.firstName[0]}{tenant.lastName[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{tenant.firstName} {tenant.lastName}</h3>
                              <Badge className={getStatusColor(tenant.status)}>{tenant.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{tenant.email}</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          {tenant.phone && (
                            <p className="text-sm flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {tenant.phone}
                            </p>
                          )}
                          {tenant.property && (
                            <p className="text-sm flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              {tenant.property.name}
                            </p>
                          )}
                          {tenant.creditScore && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Credit Score</span>
                              <span className={`font-semibold ${tenant.creditScore >= 700 ? 'text-green-600' : tenant.creditScore >= 650 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {tenant.creditScore}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          {tenant.leases && tenant.leases[0] && (
                            <p className="text-sm font-medium text-emerald-600">
                              {formatCurrency(tenant.leases[0].monthlyRent)}/mo
                            </p>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingItem(tenant); setTenantDialogOpen(true) }}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Tenant?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete {tenant.firstName} {tenant.lastName}. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDeleteTenant(tenant.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Leases Tab */}
          {activeTab === 'leases' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leases</h1>
                  <p className="text-gray-500 dark:text-gray-400">Manage rental agreements</p>
                </div>
                <Dialog open={leaseDialogOpen} onOpenChange={(open) => { setLeaseDialogOpen(open); if (!open) setEditingItem(null) }}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Lease
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Lease' : 'Create New Lease'}</DialogTitle>
                      <DialogDescription>Enter the lease details below</DialogDescription>
                    </DialogHeader>
                    <LeaseForm
                      lease={editingItem}
                      properties={properties}
                      tenants={tenants}
                      onSave={handleSaveLease}
                      onCancel={() => { setLeaseDialogOpen(false); setEditingItem(null) }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leases..."
                    className="pl-10"
                    value={leaseFilter.search}
                    onChange={(e) => setLeaseFilter({ ...leaseFilter, search: e.target.value })}
                  />
                </div>
                <Select value={leaseFilter.status} onValueChange={(value) => setLeaseFilter({ ...leaseFilter, status: value })}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING_SIGNATURE">Pending Signature</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leases List */}
              <div className="grid grid-cols-1 gap-4">
                {leases.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No leases found</p>
                      <Button onClick={seedDatabase} variant="outline">Seed Demo Data</Button>
                    </CardContent>
                  </Card>
                ) : (
                  leases.map((lease) => (
                    <Card key={lease.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{lease.leaseNumber}</h3>
                                <Badge className={getStatusColor(lease.status)}>{lease.status.replace('_', ' ')}</Badge>
                              </div>
                              <p className="text-sm text-gray-500">{lease.property.name}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8">
                            <div>
                              <p className="text-xs text-gray-500">Tenant</p>
                              <p className="font-medium">{lease.tenant.firstName} {lease.tenant.lastName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Monthly Rent</p>
                              <p className="font-medium text-emerald-600">{formatCurrency(lease.monthlyRent)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Start Date</p>
                              <p className="font-medium">{formatDate(lease.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">End Date</p>
                              <p className="font-medium">{lease.endDate ? formatDate(lease.endDate) : 'Month-to-month'}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingItem(lease); setLeaseDialogOpen(true) }}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
                  <p className="text-gray-500 dark:text-gray-400">Track rent collection and payments</p>
                </div>
                <Dialog open={paymentDialogOpen} onOpenChange={(open) => { setPaymentDialogOpen(open); if (!open) setEditingItem(null) }}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Payment</DialogTitle>
                      <DialogDescription>Enter payment details</DialogDescription>
                    </DialogHeader>
                    <PaymentForm
                      leases={leases}
                      onSave={handleSavePayment}
                      onCancel={() => { setPaymentDialogOpen(false); setEditingItem(null) }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
                    className="pl-10"
                    value={paymentFilter.search}
                    onChange={(e) => setPaymentFilter({ ...paymentFilter, search: e.target.value })}
                  />
                </div>
                <Select value={paymentFilter.status} onValueChange={(value) => setPaymentFilter({ ...paymentFilter, status: value })}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payments List */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              No payments found
                              <Button onClick={seedDatabase} variant="link">Seed Demo Data</Button>
                            </td>
                          </tr>
                        ) : (
                          payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3 font-medium">{payment.paymentNumber}</td>
                              <td className="px-4 py-3">
                                {payment.tenant.firstName} {payment.tenant.lastName}
                              </td>
                              <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                              <td className="px-4 py-3">{formatDate(payment.dueDate)}</td>
                              <td className="px-4 py-3">
                                <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                              </td>
                              <td className="px-4 py-3 text-gray-500">{payment.paymentMethod || '-'}</td>
                              <td className="px-4 py-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setEditingItem(payment); setPaymentDialogOpen(true) }}>
                                      <Edit className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
                  <p className="text-gray-500 dark:text-gray-400">Manage maintenance requests</p>
                </div>
                <Dialog open={maintenanceDialogOpen} onOpenChange={(open) => { setMaintenanceDialogOpen(open); if (!open) setEditingItem(null) }}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Request' : 'Create Maintenance Request'}</DialogTitle>
                      <DialogDescription>Enter the request details</DialogDescription>
                    </DialogHeader>
                    <MaintenanceForm
                      request={editingItem}
                      properties={properties}
                      tenants={tenants}
                      onSave={handleSaveMaintenance}
                      onCancel={() => { setMaintenanceDialogOpen(false); setEditingItem(null) }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search requests..."
                    className="pl-10"
                    value={maintenanceFilter.search}
                    onChange={(e) => setMaintenanceFilter({ ...maintenanceFilter, search: e.target.value })}
                  />
                </div>
                <Select value={maintenanceFilter.status} onValueChange={(value) => setMaintenanceFilter({ ...maintenanceFilter, status: value })}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={maintenanceFilter.priority} onValueChange={(value) => setMaintenanceFilter({ ...maintenanceFilter, priority: value })}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Priority</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Maintenance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maintenance.length === 0 ? (
                  <Card className="md:col-span-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Wrench className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No maintenance requests found</p>
                      <Button onClick={seedDatabase} variant="outline">Seed Demo Data</Button>
                    </CardContent>
                  </Card>
                ) : (
                  maintenance.map((req) => (
                    <Card key={req.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getCategoryIcon(req.category)}</span>
                            <div>
                              <h3 className="font-semibold">{req.title}</h3>
                              <p className="text-sm text-gray-500">{req.property.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(req.priority)}
                            </div>
                            <Badge className={getStatusColor(req.priority)}>{req.priority}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{req.description}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(req.status)}>{req.status.replace('_', ' ')}</Badge>
                            {req.estimatedCost && (
                              <span className="text-sm text-gray-500">Est: {formatCurrency(req.estimatedCost)}</span>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingItem(req); setMaintenanceDialogOpen(true) }}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && dashboard && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                <p className="text-gray-500 dark:text-gray-400">Comprehensive insights into your portfolio</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Property */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Property</CardTitle>
                    <CardDescription>Monthly rent distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leases.slice(0, 6).map(l => ({
                          name: l.property.name.split(' ').slice(0, 2).join(' '),
                          rent: l.monthlyRent
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis className="text-xs" tickFormatter={(v) => `$${v/1000}k`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="rent" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Property Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Property Types</CardTitle>
                    <CardDescription>Distribution by property type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboard.propertyByType.map((p, i) => ({
                              name: p.type.replace('_', ' '),
                              value: p.count
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {dashboard.propertyByType.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Status Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Collection Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Collection Rate</span>
                        <span className="text-sm font-medium">
                          {dashboard.paymentOverview.collected + dashboard.paymentOverview.pending > 0
                            ? Math.round((dashboard.paymentOverview.collected / (dashboard.paymentOverview.collected + dashboard.paymentOverview.pending + dashboard.paymentOverview.overdue)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <Progress
                        value={
                          dashboard.paymentOverview.collected + dashboard.paymentOverview.pending > 0
                            ? (dashboard.paymentOverview.collected / (dashboard.paymentOverview.collected + dashboard.paymentOverview.pending + dashboard.paymentOverview.overdue)) * 100
                            : 0
                        }
                      />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboard.paymentOverview.collected)}</p>
                        <p className="text-xs text-gray-500">Collected</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{formatCurrency(dashboard.paymentOverview.pending)}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboard.paymentOverview.overdue)}</p>
                        <p className="text-xs text-gray-500">Overdue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Performance Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                          <Building className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Occupancy Rate</p>
                          <p className="font-semibold">{dashboard.metrics.occupancyRate}%</p>
                        </div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Active Leases</p>
                          <p className="font-semibold">{dashboard.metrics.activeLeases}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Open Maintenance</p>
                          <p className="font-semibold">{dashboard.metrics.openMaintenance}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Form Components
function PropertyForm({ property, onSave, onCancel }: { property?: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: property?.name || '',
    description: property?.description || '',
    type: property?.type || 'SINGLE_FAMILY',
    status: property?.status || 'AVAILABLE',
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    zipCode: property?.zipCode || '',
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    squareFeet: property?.squareFeet || '',
    currentValue: property?.currentValue || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      squareFeet: formData.squareFeet ? parseFloat(formData.squareFeet) : null,
      currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Property Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SINGLE_FAMILY">Single Family</SelectItem>
              <SelectItem value="MULTI_FAMILY">Multi Family</SelectItem>
              <SelectItem value="APARTMENT">Apartment</SelectItem>
              <SelectItem value="CONDO">Condo</SelectItem>
              <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
              <SelectItem value="FOR_SALE">For Sale</SelectItem>
              <SelectItem value="FOR_RENT">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input id="zipCode" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })} />
        </div>
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input id="bathrooms" type="number" step="0.5" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })} />
        </div>
        <div>
          <Label htmlFor="squareFeet">Square Feet</Label>
          <Input id="squareFeet" type="number" value={formData.squareFeet} onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="currentValue">Current Value ($)</Label>
          <Input id="currentValue" type="number" value={formData.currentValue} onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Property</Button>
      </DialogFooter>
    </form>
  )
}

function TenantForm({ tenant, properties, onSave, onCancel }: { tenant?: any; properties: Property[]; onSave: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    firstName: tenant?.firstName || '',
    lastName: tenant?.lastName || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    status: tenant?.status || 'ACTIVE',
    creditScore: tenant?.creditScore || '',
    propertyId: tenant?.propertyId || '',
    employer: tenant?.employer || '',
    jobTitle: tenant?.jobTitle || '',
    monthlyIncome: tenant?.monthlyIncome || '',
    emergencyContactName: tenant?.emergencyContactName || '',
    emergencyContactPhone: tenant?.emergencyContactPhone || '',
    emergencyContactRelation: tenant?.emergencyContactRelation || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      creditScore: formData.creditScore ? parseInt(formData.creditScore) : null,
      monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
      propertyId: formData.propertyId || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="FORMER">Former</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })}>
            <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="creditScore">Credit Score</Label>
          <Input id="creditScore" type="number" value={formData.creditScore} onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="employer">Employer</Label>
          <Input id="employer" value={formData.employer} onChange={(e) => setFormData({ ...formData, employer: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input id="jobTitle" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
          <Input id="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })} />
        </div>
      </div>
      <Separator />
      <div className="space-y-2">
        <h4 className="font-medium">Emergency Contact</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="emergencyContactName">Name</Label>
            <Input id="emergencyContactName" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="emergencyContactPhone">Phone</Label>
            <Input id="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="emergencyContactRelation">Relation</Label>
            <Input id="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Tenant</Button>
      </DialogFooter>
    </form>
  )
}

function LeaseForm({ lease, properties, tenants, onSave, onCancel }: { lease?: any; properties: Property[]; tenants: Tenant[]; onSave: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    propertyId: lease?.propertyId || '',
    tenantId: lease?.tenantId || '',
    type: lease?.type || 'FIXED_TERM',
    status: lease?.status || 'DRAFT',
    startDate: lease?.startDate ? new Date(lease.startDate).toISOString().split('T')[0] : '',
    endDate: lease?.endDate ? new Date(lease.endDate).toISOString().split('T')[0] : '',
    monthlyRent: lease?.monthlyRent || '',
    securityDeposit: lease?.securityDeposit || '',
    petDeposit: lease?.petDeposit || '',
    lateFee: lease?.lateFee || '',
    paymentDueDay: lease?.paymentDueDay || 1,
    gracePeriodDays: lease?.gracePeriodDays || 5
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      monthlyRent: parseFloat(formData.monthlyRent),
      securityDeposit: parseFloat(formData.securityDeposit),
      petDeposit: formData.petDeposit ? parseFloat(formData.petDeposit) : null,
      lateFee: formData.lateFee ? parseFloat(formData.lateFee) : null,
      endDate: formData.type === 'MONTH_TO_MONTH' ? null : formData.endDate
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })} required>
            <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tenantId">Tenant</Label>
          <Select value={formData.tenantId} onValueChange={(value) => setFormData({ ...formData, tenantId: value })} required>
            <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Lease Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED_TERM">Fixed Term</SelectItem>
              <SelectItem value="MONTH_TO_MONTH">Month to Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING_SIGNATURE">Pending Signature</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="TERMINATED">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} disabled={formData.type === 'MONTH_TO_MONTH'} />
        </div>
        <div>
          <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
          <Input id="monthlyRent" type="number" value={formData.monthlyRent} onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
          <Input id="securityDeposit" type="number" value={formData.securityDeposit} onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="petDeposit">Pet Deposit ($)</Label>
          <Input id="petDeposit" type="number" value={formData.petDeposit} onChange={(e) => setFormData({ ...formData, petDeposit: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="lateFee">Late Fee ($)</Label>
          <Input id="lateFee" type="number" value={formData.lateFee} onChange={(e) => setFormData({ ...formData, lateFee: e.target.value })} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Lease</Button>
      </DialogFooter>
    </form>
  )
}

function PaymentForm({ leases, onSave, onCancel }: { leases: Lease[]; onSave: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    leaseId: '',
    type: 'RENT',
    status: 'COMPLETED',
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    dueDate: '',
    paymentDate: '',
    notes: ''
  })

  const selectedLease = leases.find(l => l.id === formData.leaseId)

  const handleLeaseChange = (leaseId: string) => {
    const lease = leases.find(l => l.id === leaseId)
    setFormData(f => ({
      ...f,
      leaseId,
      amount: lease ? String(lease.monthlyRent) : f.amount
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      tenantId: selectedLease?.tenantId,
      amount: parseFloat(formData.amount),
      totalAmount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      paymentDate: formData.status === 'COMPLETED' ? formData.paymentDate || new Date().toISOString() : null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="leaseId">Lease</Label>
          <Select value={formData.leaseId} onValueChange={handleLeaseChange} required>
            <SelectTrigger><SelectValue placeholder="Select lease" /></SelectTrigger>
            <SelectContent>
              {leases.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.leaseNumber} - {l.tenant.firstName} {l.tenant.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Payment Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="RENT">Rent</SelectItem>
              <SelectItem value="SECURITY_DEPOSIT">Security Deposit</SelectItem>
              <SelectItem value="PET_DEPOSIT">Pet Deposit</SelectItem>
              <SelectItem value="LATE_FEE">Late Fee</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input id="amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
              <SelectItem value="CHECK">Check</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="ONLINE_PAYMENT">Online Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input id="paymentDate" type="date" value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Payment</Button>
      </DialogFooter>
    </form>
  )
}

function MaintenanceForm({ request, properties, tenants, onSave, onCancel }: { request?: any; properties: Property[]; tenants: Tenant[]; onSave: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: request?.title || '',
    description: request?.description || '',
    category: request?.category || 'GENERAL_REPAIR',
    priority: request?.priority || 'MEDIUM',
    status: request?.status || 'PENDING',
    propertyId: request?.propertyId || '',
    tenantId: request?.tenantId || '',
    estimatedCost: request?.estimatedCost || '',
    notes: request?.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
      tenantId: formData.tenantId || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })} required>
            <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tenantId">Tenant (Optional)</Label>
          <Select value={formData.tenantId} onValueChange={(value) => setFormData({ ...formData, tenantId: value })}>
            <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
            <SelectContent>
              {tenants.filter(t => t.propertyId === formData.propertyId).map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PLUMBING">🔧 Plumbing</SelectItem>
              <SelectItem value="ELECTRICAL">⚡ Electrical</SelectItem>
              <SelectItem value="HVAC">❄️ HVAC</SelectItem>
              <SelectItem value="APPLIANCE">🧰 Appliance</SelectItem>
              <SelectItem value="STRUCTURAL">🏗️ Structural</SelectItem>
              <SelectItem value="LANDSCAPING">🌳 Landscaping</SelectItem>
              <SelectItem value="PEST_CONTROL">🐛 Pest Control</SelectItem>
              <SelectItem value="PAINTING">🎨 Painting</SelectItem>
              <SelectItem value="GENERAL_REPAIR">🔨 General Repair</SelectItem>
              <SelectItem value="SAFETY">🛡️ Safety</SelectItem>
              <SelectItem value="OTHER">📋 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="EMERGENCY">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
          <Input id="estimatedCost" type="number" value={formData.estimatedCost} onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
        </div>
        <div className="col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Request</Button>
      </DialogFooter>
    </form>
  )
}
