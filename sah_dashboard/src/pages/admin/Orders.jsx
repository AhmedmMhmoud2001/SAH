import { useMemo, useState, useEffect } from 'react'
import { Eye, RefreshCcw, Search, BadgeDollarSign, Clock3, CheckCircle2, RotateCcw } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { getAdminOrders, updateAdminOrder, createAdminRefund } from '../../api'
import './AdminPages.css'

export default function Orders() {
  const { t, isRTL } = useI18n()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [q, setQ] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundData, setRefundData] = useState({ amount: 0, reason: '' })

  useEffect(() => { loadOrders() }, [statusFilter])

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await getAdminOrders({ status: statusFilter })
      setOrders(data.orders || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(id, newStatus) {
    try {
      await updateAdminOrder(id, { status: newStatus })
      loadOrders()
    } catch (error) {
      alert(t('orders.updateStatusFailed'))
    }
  }

  async function handleRefund(e) {
    e.preventDefault()
    try {
      await createAdminRefund({ 
        orderId: selectedOrder.id, 
        amount: refundData.amount, 
        reason: refundData.reason 
      })
      setShowRefundModal(false)
      setShowDetailModal(false)
      loadOrders()
    } catch (error) {
      alert(t('orders.refundFailed'))
    }
  }

  const getStatusBadge = (status) => {
    const classes = { 
      paid: 'badge-success', 
      pending: 'badge-warning', 
      cancelled: 'badge-danger', 
      refunded: 'badge-info' 
    }
    return classes[status] || 'badge'
  }

  const filtered = useMemo(() => {
    const query = String(q || '').trim().toLowerCase()
    if (!query) return orders
    return (orders || []).filter((o) => {
      const id = String(o?.id || '').toLowerCase()
      const name = String(o?.user?.name || '').toLowerCase()
      const email = String(o?.user?.email || '').toLowerCase()
      const code = String(o?.couponCode || '').toLowerCase()
      return id.includes(query) || name.includes(query) || email.includes(query) || code.includes(query)
    })
  }, [orders, q])

  const kpis = useMemo(() => {
    const list = filtered || []
    const total = list.length
    const pending = list.filter((o) => o.status === 'pending').length
    const paid = list.filter((o) => o.status === 'paid').length
    const refunded = list.filter((o) => o.status === 'refunded').length
    const revenue = list
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + Number(o?.totalAmount || 0), 0)
    const currency = list.find((o) => o?.currency)?.currency || 'SAR'
    return { total, pending, paid, refunded, revenue, currency }
  }, [filtered])

  const ordersTitle = t('orders.title')

  return (
    <div className="admin-page">
      <div className="ordersHeader">
        <div className="ordersHeader__meta">
          <h1 className="ordersHeader__title">{ordersTitle}</h1>
          <p className="ordersHeader__sub">
            {isRTL ? 'متابعة الطلبات وحالات الدفع والاسترجاع.' : 'Track orders, payments, and refunds.'}
          </p>
        </div>
        <div className="ordersHeader__actions">
          <button className="btn btn-secondary" onClick={loadOrders} disabled={loading}>
            <RefreshCcw size={18} /> {loading ? t('msg.loading') : (isRTL ? 'تحديث' : 'Refresh')}
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <p className="stat-card-title">{isRTL ? 'إجمالي الطلبات' : 'Total orders'}</p>
          <p className="stat-card-value">{kpis.total}</p>
          <div className="stat-card-icon" style={{ color: 'var(--primary)' }}><BadgeDollarSign size={32} /></div>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">{t('orders.status.pending')}</p>
          <p className="stat-card-value">{kpis.pending}</p>
          <div className="stat-card-icon" style={{ color: '#f59e0b' }}><Clock3 size={32} /></div>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">{t('orders.status.paid')}</p>
          <p className="stat-card-value">{kpis.paid}</p>
          <div className="stat-card-icon" style={{ color: '#10b981' }}><CheckCircle2 size={32} /></div>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">{t('orders.status.refunded')}</p>
          <p className="stat-card-value">{kpis.refunded}</p>
          <div className="stat-card-icon" style={{ color: '#38bdf8' }}><RotateCcw size={32} /></div>
        </div>
      </div>

      <div className="ordersFilters">
        <div className="ordersFilters__left">
          <div className="ordersSearch">
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isRTL ? 'بحث برقم الطلب / الاسم / البريد / الكوبون' : 'Search by order id / name / email / coupon'}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">{t('orders.allStatuses')}</option>
            <option value="pending">{t('orders.status.pending')}</option>
            <option value="paid">{t('orders.status.paid')}</option>
            <option value="cancelled">{t('orders.status.cancelled')}</option>
            <option value="refunded">{t('orders.status.refunded')}</option>
          </select>
        </div>
        <div className="ordersFilters__right">
          <div className="ordersRevenuePill">
            <span className="ordersRevenuePill__label">{isRTL ? 'إيرادات (مدفوع)' : 'Revenue (paid)'}</span>
            <span className="ordersRevenuePill__value">{kpis.revenue.toFixed(2)} {kpis.currency}</span>
          </div>
        </div>
      </div>

      {loading ? <p>{t('msg.loading')}</p> : (
        <div className="ordersTableWrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('orders.orderId')}</th>
              <th>{t('orders.customer')}</th>
              <th>{t('orders.amount')}</th>
              <th>{t('orders.status')}</th>
              <th>{t('orders.date')}</th>
              <th>{t('orders.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id}>
                <td><span className="text-mono" style={{ fontSize: '12px' }}>{order.id.split('-')[0]}...</span></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{order.user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                </td>
                <td>{order.totalAmount} {order.currency}</td>
                <td><span className={`badge ${getStatusBadge(order.status)}`}>{t(`orders.status.${order.status}`) || order.status}</span></td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }} title={t('orders.viewDetails')}>
                      <Eye size={18} />
                    </button>
                    {order.status === 'paid' && (
                      <button className="action-btn" onClick={() => { setSelectedOrder(order); setRefundData({ amount: order.totalAmount, reason: '' }); setShowRefundModal(true); }} title={t('orders.processRefund')}>
                        <RefreshCcw size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2>{t('orders.details')}</h2>
            <div className="order-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div>
                <p><strong>{t('orders.customer')}:</strong> {selectedOrder.user?.name}</p>
                <p><strong>{isRTL ? 'البريد الإلكتروني' : 'Email'}:</strong> {selectedOrder.user?.email}</p>
                <p><strong>{t('orders.status')}:</strong> <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>{t(`orders.status.${selectedOrder.status}`) || selectedOrder.status}</span></p>
              </div>
              <div>
                <p><strong>{t('orders.amount')}:</strong> {selectedOrder.totalAmount} {selectedOrder.currency}</p>
                <p><strong>{t('orders.date')}:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <h3 style={{ marginTop: '20px' }}>{t('orders.items')}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {selectedOrder.enrollments?.map(e => (
                <li key={e.id} style={{ padding: '10px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{e.course?.title}</span>
                  <span>{isRTL ? `${e.course?.price} ر.س` : `${e.course?.price} SAR`}</span>
                </li>
              ))}
            </ul>

            <div className="form-actions" style={{ marginTop: '30px' }}>
              <button className="btn" onClick={() => setShowDetailModal(false)}>{t('orders.close')}</button>
              {selectedOrder.status === 'pending' && (
                <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder.id, 'paid')}>{t('orders.markPaid')}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('orders.processRefund')}</h2>
            <form onSubmit={handleRefund}>
              <div className="form-group">
                <label>{t('orders.refundAmount')} ({selectedOrder?.currency})</label>
                <input 
                  type="number" 
                  max={selectedOrder?.totalAmount} 
                  value={refundData.amount} 
                  onChange={e => setRefundData({...refundData, amount: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('orders.refundReason')}</label>
                <textarea 
                  value={refundData.reason} 
                  onChange={e => setRefundData({...refundData, reason: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowRefundModal(false)}>{t('actions.cancel')}</button>
                <button type="submit" className="btn btn-danger">{t('orders.confirmRefund')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
