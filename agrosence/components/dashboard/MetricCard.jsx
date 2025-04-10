const MetricCard = ({ title, value, change, icon, color }) => {
  const isPositive = !change.includes('-')
  
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="pe-2">
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className="mb-0 fs-4 fs-md-3">{value}</h3>
            <small className={`${isPositive ? 'text-success' : 'text-danger'}`}>
              {change}
            </small>
          </div>
          <div className={`rounded-circle p-3 bg-${color} bg-opacity-10 d-none d-sm-block`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetricCard
